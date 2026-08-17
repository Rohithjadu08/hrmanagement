import { loadDotEnv } from '../loadEnv.mjs'
loadDotEnv()

import { supabaseAdmin } from '../config/supabaseClient.js'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

async function test() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: 'gemini-embedding-2',
    apiKey: process.env.GOOGLE_API_KEY
  })
  
  const queryEmbedding = await embeddings.embedQuery('What are the standard working hours?')
  
  const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.0, // test with 0 threshold
    match_count: 5
  })
  
  console.log('Error:', error)
  console.log('Matches:', data)
}

test().catch(console.error)
