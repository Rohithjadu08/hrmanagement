import jwt from 'jsonwebtoken'

export function signJwt({ sub, role, accountType, status }) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')

  const expiresIn = process.env.JWT_EXPIRES_IN || '8h'

  return jwt.sign(
    {
      sub,
      role,
      accountType,
      status
    },
    secret,
    { expiresIn }
  )
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')

  return jwt.verify(token, secret)
}

