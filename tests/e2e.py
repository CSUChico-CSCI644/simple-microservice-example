#!/usr/bin/env python3
import json
import sys
import time
import urllib.error
import urllib.request


BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")


class ContractFailure(Exception):
    pass


def fail(message):
    raise ContractFailure(message)


def assert_true(condition, message):
    if not condition:
        fail(message)


def request(path, method="GET", payload=None, headers=None):
    url = BASE_URL + path
    body = None
    request_headers = headers.copy() if headers else {}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        request_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=body, headers=request_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            response_body = response.read().decode("utf-8")
            return response.status, lower_headers(response.headers), response_body
    except urllib.error.HTTPError as exc:
        response_body = exc.read().decode("utf-8")
        return exc.code, lower_headers(exc.headers), response_body
    except urllib.error.URLError as exc:
        fail("Unable to reach {}: {}".format(url, exc))


def lower_headers(headers):
    return {key.lower(): value for key, value in headers.items()}


def json_request(path, method="GET", payload=None, headers=None):
    status, response_headers, response_body = request(path, method, payload, headers)
    try:
        parsed = json.loads(response_body)
    except json.JSONDecodeError:
        fail("{} did not return JSON: {}".format(path, response_body[:200]))
    return status, response_headers, parsed


def require_keys(document, keys, context):
    missing = [key for key in keys if key not in document]
    assert_true(not missing, "{} missing keys: {}".format(context, ", ".join(missing)))


def test_frontend():
    status, _, body = request("/")
    assert_true(status == 200, "frontend should return HTTP 200")
    assert_true("Get a quote" in body, "frontend HTML should be served from BASE_URL")


def test_status_and_request_id():
    request_id = "contract-test-{}".format(int(time.time()))
    status, headers, payload = json_request("/api/status", headers={"X-Request-ID": request_id})
    assert_true(status == 200, "/api/status should return HTTP 200")
    assert_true(payload.get("status") == "ok", "/api/status should return status ok")
    assert_true(headers.get("x-request-id") == request_id, "gateway should echo X-Request-ID")


def test_health_and_readiness():
    status, _, payload = json_request("/api/healthz")
    assert_true(status == 200, "/api/healthz should return HTTP 200")
    assert_true(payload.get("status") == "ok", "/api/healthz should return status ok")

    status, _, payload = json_request("/api/readyz")
    assert_true(status == 200, "/api/readyz should return HTTP 200")
    assert_true(payload.get("status") == "ok", "/api/readyz should return status ok")


def test_version_metadata():
    status, _, payload = json_request("/api/version")
    assert_true(status == 200, "/api/version should return HTTP 200")
    require_keys(payload, ["gateway", "quoteService"], "/api/version")
    require_keys(payload["gateway"], ["service", "version", "gitSha", "buildTime", "environment"], "gateway version")
    require_keys(payload["quoteService"], ["service", "version", "gitSha", "buildTime", "environment"], "quote service version")


def test_seeded_quote_is_present():
    status, _, payload = json_request("/api/quotes/1")
    assert_true(status == 200, "seeded quote id 1 should be retrievable")
    assert_true(payload.get("quote"), "seeded quote should include quote text")
    assert_true(payload.get("by"), "seeded quote should include author")


def test_random_quote_and_counter():
    first_status, _, first = json_request("/api/randomquote")
    second_status, _, second = json_request("/api/randomquote")

    assert_true(first_status == 200, "first random quote should return HTTP 200")
    assert_true(second_status == 200, "second random quote should return HTTP 200")
    require_keys(first, ["time", "quote"], "first random quote response")
    require_keys(first["quote"], ["quote", "by", "count"], "first random quote payload")
    require_keys(second["quote"], ["quote", "by", "count"], "second random quote payload")

    first_count = int(first["quote"]["count"])
    second_count = int(second["quote"]["count"])
    assert_true(second_count == first_count + 1, "Redis-backed quote count should increment by 1")


def test_create_and_read_quote():
    marker = "contract quote {}".format(int(time.time()))
    status, _, created = json_request(
        "/api/quotes",
        method="POST",
        payload={"quote": marker, "by": "CSCI644 contract test"},
    )

    assert_true(status == 201, "POST /api/quotes should return HTTP 201")
    require_keys(created, ["id", "quote", "by"], "created quote")
    assert_true(created["quote"] == marker, "created quote text should match")

    status, _, fetched = json_request("/api/quotes/{}".format(created["id"]))
    assert_true(status == 200, "created quote should be retrievable")
    assert_true(fetched["quote"] == marker, "retrieved quote text should match")
    assert_true(fetched["by"] == "CSCI644 contract test", "retrieved quote author should match")


def main():
    tests = [
        test_frontend,
        test_status_and_request_id,
        test_health_and_readiness,
        test_version_metadata,
        test_seeded_quote_is_present,
        test_random_quote_and_counter,
        test_create_and_read_quote,
    ]

    for test in tests:
        test()
        print("PASS {}".format(test.__name__))

    print("All contract tests passed for {}".format(BASE_URL))


if __name__ == "__main__":
    try:
        main()
    except ContractFailure as exc:
        print("FAIL {}".format(exc), file=sys.stderr)
        sys.exit(1)
