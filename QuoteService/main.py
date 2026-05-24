import json
import os
import uuid
from datetime import datetime, timezone

def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError("Missing required environment variable: {}".format(name))
    return value


def int_env(name, default):
    value = os.environ.get(name, default)
    try:
        return int(value)
    except ValueError:
        raise RuntimeError("{} must be an integer".format(name))


CONFIG = {
    "mongo_host": require_env("MONGO_HOST"),
    "mongo_port": int_env("MONGO_PORT", "27017"),
    "mongo_user": require_env("MONGO_USER"),
    "mongo_password": require_env("MONGO_PASSWORD"),
    "mongo_auth_source": os.environ.get("MONGO_AUTH_SOURCE", "admin"),
    "mongo_db": os.environ.get("MONGO_DB", "quote_db"),
    "mongo_collection": os.environ.get("MONGO_COLLECTION", "quote_tb"),
    "redis_host": require_env("REDIS_HOST"),
    "redis_port": int_env("REDIS_PORT", "6379"),
    "redis_password": os.environ.get("REDIS_PASSWORD") or None,
    "app_env": os.environ.get("APP_ENV", "development"),
    "app_version": os.environ.get("APP_VERSION", "1.1.0"),
    "build_sha": os.environ.get("BUILD_SHA", "unknown"),
    "build_time": os.environ.get("BUILD_TIME", "unknown"),
    "port": int_env("PORT", "5000"),
}

import redis  # noqa: E402
from flask import Flask, g, jsonify, request  # noqa: E402
from pymongo import MongoClient  # noqa: E402
from pymongo.errors import PyMongoError  # noqa: E402


def get_mongo_client():
    return MongoClient(
        host=CONFIG["mongo_host"],
        port=CONFIG["mongo_port"],
        username=CONFIG["mongo_user"],
        password=CONFIG["mongo_password"],
        authSource=CONFIG["mongo_auth_source"],
        serverSelectionTimeoutMS=2000,
    )


def get_quote_collection(client):
    return client[CONFIG["mongo_db"]][CONFIG["mongo_collection"]]


def get_redis():
    return redis.Redis(
        host=CONFIG["redis_host"],
        port=CONFIG["redis_port"],
        password=CONFIG["redis_password"],
        socket_connect_timeout=2,
        socket_timeout=2,
        decode_responses=True,
    )


def version_info():
    return {
        "service": "quote-service",
        "version": CONFIG["app_version"],
        "gitSha": CONFIG["build_sha"],
        "buildTime": CONFIG["build_time"],
        "environment": CONFIG["app_env"],
    }


def public_quote(document, count=None):
    response = {
        "id": document.get("id"),
        "quote": document.get("quote"),
        "by": document.get("author") or document.get("by"),
    }
    if count is not None:
        response["count"] = count
    return response


def normalize_quote_id(quote_id):
    if quote_id.isdigit():
        return int(quote_id)
    return quote_id


def log_request(response):
    app.logger.info(
        json.dumps(
            {
                "event": "request",
                "service": "quote-service",
                "requestId": getattr(g, "request_id", None),
                "method": request.method,
                "path": request.path,
                "status": response.status_code,
            }
        )
    )
    return response


app = Flask(__name__)


@app.before_request
def assign_request_id():
    g.request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex


@app.after_request
def add_request_id(response):
    response.headers["X-Request-ID"] = g.request_id
    return log_request(response)


@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok", "service": "quote-service"})


@app.route("/readyz")
def readyz():
    checks = {}
    status_code = 200

    client = None
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        checks["mongo"] = "ok"
    except Exception as exc:
        status_code = 503
        checks["mongo"] = str(exc)
    finally:
        if client is not None:
            client.close()

    try:
        get_redis().ping()
        checks["redis"] = "ok"
    except Exception as exc:
        status_code = 503
        checks["redis"] = str(exc)

    return jsonify({"status": "ok" if status_code == 200 else "error", "checks": checks}), status_code


@app.route("/version")
def version():
    return jsonify(version_info())


@app.route("/api/quote")
def quote():
    client = None
    try:
        client = get_mongo_client()
        collection = get_quote_collection(client)
        count = int(get_redis().incr("count"))
        result = collection.aggregate(pipeline=[{"$sample": {"size": 1}}]).try_next()

        if result:
            return jsonify(public_quote(result, count=count))

        return jsonify({"quote": "No quotes found", "by": "Unknown", "count": count})
    except (PyMongoError, redis.RedisError) as exc:
        app.logger.exception("Unable to retrieve random quote")
        return jsonify({"message": "Unable to retrieve random quote", "error": str(exc)}), 503
    finally:
        if client is not None:
            client.close()


@app.route("/api/quotes", methods=["POST"])
def create_quote():
    payload = request.get_json(silent=True) or {}
    quote_text = (payload.get("quote") or "").strip()
    author = (payload.get("by") or payload.get("author") or "").strip()

    if not quote_text or not author:
        return jsonify({"message": "quote and by are required"}), 400

    document = {
        "id": uuid.uuid4().hex,
        "quote": quote_text,
        "author": author,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    client = None
    try:
        client = get_mongo_client()
        get_quote_collection(client).insert_one(document)
        return jsonify(public_quote(document)), 201
    except PyMongoError as exc:
        app.logger.exception("Unable to create quote")
        return jsonify({"message": "Unable to create quote", "error": str(exc)}), 503
    finally:
        if client is not None:
            client.close()


@app.route("/api/quotes/<quote_id>")
def get_quote(quote_id):
    client = None
    try:
        client = get_mongo_client()
        result = get_quote_collection(client).find_one({"id": normalize_quote_id(quote_id)})
        if not result:
            return jsonify({"message": "Quote not found"}), 404
        return jsonify(public_quote(result))
    except PyMongoError as exc:
        app.logger.exception("Unable to retrieve quote")
        return jsonify({"message": "Unable to retrieve quote", "error": str(exc)}), 503
    finally:
        if client is not None:
            client.close()


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"message": "Resource not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=CONFIG["port"], debug=CONFIG["app_env"] != "production")
