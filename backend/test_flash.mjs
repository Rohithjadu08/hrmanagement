import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()

import { GoogleGenerativeAI } from '@google/generative-ai'

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent("Hello")
    console.log(result.response.text())
  } catch (err) {
    console.error('Error:', err)
  }
}
test()
