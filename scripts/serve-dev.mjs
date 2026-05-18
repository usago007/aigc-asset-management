import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

const host = '127.0.0.1'
const preferredPort = 5173
const maxPortAttempts = 20

const projectRoot = process.cwd()
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, host)
  })

const findAvailablePort = async (startPort) => {
  for (let port = startPort; port < startPort + maxPortAttempts; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(port)
    if (available) return port
  }
  throw new Error(`未找到可用端口，已尝试 ${startPort}-${startPort + maxPortAttempts - 1}`)
}

const port = await findAvailablePort(preferredPort)
const devUrl = `http://${host}:${port}/`

console.log(`Live dev ready: ${devUrl}`)
console.log('这是实时源码入口，适合验收文案、样式和交互改动。')
console.log(`Image generation: ${devUrl}content/image-generation`)
console.log(`Video generation: ${devUrl}content/video-generation`)
console.log(`Shot detail: ${devUrl}content/shots/shot-1-1`)

const child = spawn(process.execPath, [viteBin, '--host', host, '--port', String(port), '--strictPort'], {
  cwd: projectRoot,
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

