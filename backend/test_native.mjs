import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()

import { GoogleGenerativeAI } from '@google/generative-ai'

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "embedding-001" })
    const result = await model.embedContent("Hello world")
    console.log(result.embedding.values.length)
  } catch (err) {
    console.error('Error:', err)
  }
}
test()
