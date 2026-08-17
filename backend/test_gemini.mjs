import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

async function test() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GOOGLE_API_KEY
    })

    const vectors = await embeddings.embedDocuments(['This is a test document'])
    console.log('Vectors returned:', vectors.length)
    if (vectors.length > 0) {
      console.log('Vector dimension:', vectors[0].length)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

test()
