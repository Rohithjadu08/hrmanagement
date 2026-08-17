import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

function run(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...opts })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

async function main() {
  const root = process.cwd()
  const frontendDir = path.join(root, 'frontend')
  const backendDir = path.join(root, 'backend')

  console.log('[combined] Building frontend (frontend/)...')
  await run('npm', ['run', 'build'], { cwd: frontendDir })

  console.log('[combined] Starting backend (backend/)...')
  await run('npm', ['start'], { cwd: backendDir })
}

main().catch((e) => {
  console.error('[combined] FAILED:', e?.message || e)
  process.exit(1)
})

