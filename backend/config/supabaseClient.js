import { createClient } from '@supabase/supabase-js'
import { loadDotEnv } from '../loadEnv.mjs'
loadDotEnv()

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`${name} not set`)
  return v
}

const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

// Backend-only client using SERVICE_ROLE key (never expose to frontend)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
})

export default supabaseAdmin

