import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

async function test() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-2', // try this instead of text-embedding-004
      apiKey: process.env.GOOGLE_API_KEY
    })
    
    const chunks = ['Hello world']
    const vectors = await embeddings.embedDocuments(chunks)
    console.log('Got vectors:', vectors.length)
    if (vectors.length > 0) {
      console.log('First vector length:', vectors[0].length)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}
test()
