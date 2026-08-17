import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()

import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

async function test() {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash-latest',
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY
  })
  
  try {
    const res = await llm.invoke('Hello')
    console.log('Success:', res.content)
  } catch (err) {
    console.error('Error with gemini-1.5-flash-latest:', err.message)
  }
}

test()
