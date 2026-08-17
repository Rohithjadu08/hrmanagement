import { loadDotEnv } from './loadEnv.mjs'
loadDotEnv()

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`)
    const json = await res.json()
    console.log(json.models.filter(m => m.name.includes('embed')).map(m => m.name))
  } catch (err) {
    console.error('Error:', err)
  }
}
test()
