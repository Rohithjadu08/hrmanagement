import { verifyJwt, signJwt } from './jwt.js'

// Make verifyJwt available for authRoutes without dynamic import complications
if (!globalThis.__reckonAuthJwt) {
  globalThis.__reckonAuthJwt = { verifyJwt, signJwt }
}

