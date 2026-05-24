const crypto = require('crypto')

function requireEnv(name) {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

function versionInfo() {
    return {
        service: 'api-gateway',
        version: process.env.APP_VERSION || '1.1.0',
        gitSha: process.env.BUILD_SHA || 'unknown',
        buildTime: process.env.BUILD_TIME || 'unknown',
        environment: process.env.APP_ENV || 'development'
    }
}

const QUOTES_API_GATEWAY = requireEnv('QUOTES_API').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 3000)
const PORT = Number(process.env.PORT || 3000)

const express = require('express')
const axios = require('axios')
const cors = require('cors')

const quoteService = axios.create({
    baseURL: QUOTES_API_GATEWAY,
    timeout: REQUEST_TIMEOUT_MS
})

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    req.requestId = req.get('X-Request-ID') || crypto.randomBytes(16).toString('hex')
    res.set('X-Request-ID', req.requestId)
    res.on('finish', () => {
        console.log(JSON.stringify({
            event: 'request',
            service: 'api-gateway',
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            status: res.statusCode
        }))
    })
    next()
})

function requestHeaders(req) {
    return {
        'X-Request-ID': req.requestId
    }
}

function proxyError(res, error) {
    if (error.response) {
        return res.status(error.response.status).json(error.response.data)
    }

    return res.status(503).json({
        message: 'Quote service request failed',
        error: error.message
    })
}

app.get('/api/status', (req, res) => {
    return res.json({ status: 'ok' })
})

app.get('/api/healthz', (req, res) => {
    return res.json({ status: 'ok', service: 'api-gateway' })
})

app.get('/api/readyz', async (req, res) => {
    try {
        const ready = await quoteService.get('/readyz', { headers: requestHeaders(req) })
        return res.json({
            status: 'ok',
            checks: {
                gateway: 'ok',
                quoteService: ready.data
            }
        })
    } catch (error) {
        return res.status(503).json({
            status: 'error',
            checks: {
                gateway: 'ok',
                quoteService: error.response ? error.response.data : error.message
            }
        })
    }
})

app.get('/api/version', async (req, res) => {
    const payload = {
        gateway: versionInfo(),
        quoteService: null
    }

    try {
        const response = await quoteService.get('/version', { headers: requestHeaders(req) })
        payload.quoteService = response.data
        return res.json(payload)
    } catch (error) {
        payload.quoteService = {
            status: 'unavailable',
            error: error.message
        }
        return res.status(503).json(payload)
    }
})

app.get('/api/randomquote', async (req, res) => {
    try {
        const response = await quoteService.get('/api/quote', { headers: requestHeaders(req) })
        return res.json({
            time: Date.now(),
            quote: response.data
        })
    } catch (error) {
        return proxyError(res, error)
    }
})

app.post('/api/quotes', async (req, res) => {
    try {
        const response = await quoteService.post('/api/quotes', req.body, { headers: requestHeaders(req) })
        return res.status(response.status).json(response.data)
    } catch (error) {
        return proxyError(res, error)
    }
})

app.get('/api/quotes/:id', async (req, res) => {
    try {
        const response = await quoteService.get(`/api/quotes/${encodeURIComponent(req.params.id)}`, {
            headers: requestHeaders(req)
        })
        return res.status(response.status).json(response.data)
    } catch (error) {
        return proxyError(res, error)
    }
})

app.get('*', (req, res) => {
    res.status(404)
    return res.json({
        message: 'Resource not found'
    })
})

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`API Gateway is listening on port ${PORT}!`)
    })
}

module.exports = app
