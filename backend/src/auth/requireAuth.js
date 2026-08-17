import { verifyJwt } from './jwt.js'

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' })

    const payload = verifyJwt(token)
    req.user = payload
    return next()
  } catch (_e) {
    return res.status(401).json({ error: 'UNAUTHORIZED' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED' })
    if (req.user.role !== role) return res.status(403).json({ error: 'FORBIDDEN' })
    next()
  }
}

export function requireAccountType(accountType) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED' })
    if (req.user.accountType !== accountType) return res.status(403).json({ error: 'FORBIDDEN' })
    next()
  }
}

export function requireApprovedEmployee() {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED' })
    if (req.user.accountType !== 'EMPLOYEE') return res.status(403).json({ error: 'FORBIDDEN' })
    if (req.user.status !== 'APPROVED') return res.status(403).json({ error: 'NOT_APPROVED' })
    next()
  }
}

