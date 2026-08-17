import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  console.log('Testing Supabase...')
  // Test conversations insert
  const { data: conv, error: convErr } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: '11111111-1111-1111-1111-111111111111', title: 'Test' })
    .select('id')
    .single()
  
  if (convErr) {
    console.error('Conv Error:', convErr.message || convErr)
  } else {
    console.log('Conv OK:', conv.id)
  }

  // Test match_document_chunks
  const dummyEmbedding = new Array(1536).fill(0.1)
  const { data: matches, error: rpcErr } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: dummyEmbedding,
    match_threshold: 0.75,
    match_count: 5
  })
  if (rpcErr) {
    console.error('RPC Error:', rpcErr.message || rpcErr)
  } else {
    console.log('RPC OK:', matches?.length)
  }
}

test()
