import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. DB operations will fail.');
}

// We use the service role key for the backend to bypass RLS for admin operations,
// or we can pass the user's JWT if we want to enforce RLS at the database level.
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function initDb() {
  // Previously this initialized SQLite.
  // Now we just verify Supabase connection works by doing a simple health check query.
  if (!supabaseUrl || !supabaseServiceKey) return;
  
  const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
  if (error) {
    console.error('Failed to connect to Supabase or missing profiles table:', error.message);
    throw error;
  }
  console.log('Supabase connection verified.');
}
