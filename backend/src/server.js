import express from 'express'

import { loadDotEnv } from '../loadEnv.mjs'
loadDotEnv()

import cors from 'cors'


import cookieParser from 'cookie-parser'
import './auth/jwtGlobal.js'
import { authRouter } from './routes/authRoutes.js'
import { hrRouter } from './routes/hrRoutes.js'
import { chatRoutes } from './routes/chatRoutes.js'
import { employeeRoutes } from './routes/employeeRoutes.js'
import { initDb } from './db/initDb.js'

function getEnv(name, fallback) {
  const v = process.env[name]
  if (v === undefined || v === '') return fallback
  return v
}

function requireEnv(name) {
  const v = process.env[name]
  if (v === undefined || v === '') return null
  return v
}


function logStartupError({ reason, error, missingVars }) {
  console.error('--- SERVER STARTUP FAILED ---')
  console.error(`WHY: ${reason}`)
  if (Array.isArray(missingVars) && missingVars.length > 0) {
    console.error(`Missing required environment variable(s): ${missingVars.join(', ')}`)
  }
  if (error) {
    console.error('Error message:', error.message)
    if (error.stack) console.error(error.stack)
  }
  console.error('--------------------------------')
}

function isAddrInUseError(err) {
  // Node uses code === 'EADDRINUSE'
  return err && (err.code === 'EADDRINUSE' || /EADDRINUSE/.test(String(err.message || '')))
}

async function ensurePortNotInUse(port) {
  // Attempt a temporary bind to detect port conflicts with a clean, explicit log.
  const probe = express()
  return await new Promise((resolve, reject) => {
    const server = probe.listen(port, () => {
      server.close(() => resolve(true))
    })
    server.on('error', (err) => {
      reject(err)
    })
  })
}

async function main() {
  process.on('unhandledRejection', (reason) => {
    console.error('--- UNHANDLED REJECTION ---')
    console.error('WHY: unhandled promise rejection')
    console.error(reason)
    console.error('-----------------------------')
  })

  process.on('uncaughtException', (err) => {
    console.error('--- UNCAUGHT EXCEPTION ---')
    console.error('WHY: uncaught exception')
    console.error(err)
    console.error('---------------------------')
    // Let the process crash after logging to avoid running in a broken state.
    process.exit(1)
  })

  const missingVars = []
  const portRaw = requireEnv('PORT')
  const supabaseUrl = requireEnv('SUPABASE_URL')
  const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (portRaw === null) missingVars.push('PORT')
  if (supabaseUrl === null) missingVars.push('SUPABASE_URL')
  if (supabaseKey === null) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')

  if (missingVars.length > 0) {
    logStartupError({ reason: 'Missing required environment variables', missingVars })
    throw new Error('Startup aborted due to missing environment variables')
  }

  const app = express()
  const port = Number(portRaw)
  const clientOrigin = getEnv('CLIENT_ORIGIN', 'http://localhost:5173')

  app.use(express.json())
  app.use(cookieParser())

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow localhost for dev, any vercel app, or the explicit CLIENT_ORIGIN
        if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app') || origin === clientOrigin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true
    })
  )

  try {
    await ensurePortNotInUse(port)
  } catch (err) {
    if (isAddrInUseError(err)) {
      console.error(`Port ${port} is already in use — please close the other process or change PORT in .env`)
      process.exit(1)
    }
    logStartupError({ reason: 'Startup failed while checking port availability', error: err })
    throw err
  }

  try {
    await initDb()
  } catch (err) {
    logStartupError({ reason: 'DB connection/init failure', error: err })
    throw err
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/hr', hrRouter)
  app.use('/api/employee', employeeRoutes)
  app.use('/api/chat', chatRoutes)

  // --- Serve React SPA (frontend/dist) from the same Express server ---
  // This must come AFTER API routes.
  const __filename = (await import('node:url')).fileURLToPath(import.meta.url)
  const __dirname = (await import('node:path')).dirname(__filename)
  const path = await import('node:path')

  const distPath = path.join(__dirname, '../../frontend/dist')
  const indexHtmlPath = path.join(distPath, 'index.html')

  app.use(express.static(distPath))

  // SPA fallback: for non-API GET requests, serve index.html
  // so client-side routing (e.g. /login, /dashboard) works on refresh.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    if (req.method !== 'GET') return next()

    // If it looks like a file request (has an extension), don't hijack it.
    if (path.extname(req.path)) return next()

    res.sendFile(indexHtmlPath, (err) => {
      if (err) next()
    })
  })

  // Basic error handler
  app.use((err, _req, res, _next) => {
    console.error('--- REQUEST ERROR ---')
    console.error(err)
    console.error('----------------------')
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  })

  app.listen(port, () => {
    console.log(`Reckon backend listening on http://localhost:${port}`)
    console.log(`Health endpoint: http://localhost:${port}/health`)
  })
}

main().catch((e) => {
  // Ensure we always print a clear WHY for startup crashes.
  if (e && e.message && /missing environment variables/i.test(e.message)) {
    process.exit(1)
  }
  console.error(e)
  process.exit(1)
})


