import bcrypt from 'bcrypt'

export async function hashPassword(password) {
  const rounds = 12
  return bcrypt.hash(password, rounds)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

