import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

const host = '127.0.0.1'
const preferredPort = 4173
const maxPortAttempts = 20

const projectRoot = process.cwd()
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const srcDir = path.join(projectRoot, 'src')
const distIndexPath = path.join(projectRoot, 'dist', 'index.html')

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

const getLatestMtimeMs = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  let latest = 0
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      latest = Math.max(latest, await getLatestMtimeMs(fullPath))
    } else if (entry.isFile()) {
      // eslint-disable-next-line no-await-in-loop
      const stat = await fs.stat(fullPath)
      latest = Math.max(latest, stat.mtimeMs)
    }
  }
  return latest
}

const port = await findAvailablePort(preferredPort)
const previewUrl = `http://${host}:${port}/`

let previewWarning = ''
try {
  const [srcLatest, distStat] = await Promise.all([
    getLatestMtimeMs(srcDir),
    fs.stat(distIndexPath),
  ])
  if (srcLatest > distStat.mtimeMs) {
    previewWarning = '警告：src/ 比当前 dist/ 更新。若你要验最新改动，请先重新执行 npm run build。'
  }
} catch (error) {
  previewWarning = `提示：未能完成构建新旧校验，原因: ${error instanceof Error ? error.message : String(error)}`
}

console.log(`Acceptance preview ready: ${previewUrl}`)
console.log('这是构建产物入口，不会自动反映后续源码修改。')
if (previewWarning) console.log(previewWarning)
console.log(`Image generation: ${previewUrl}#/content/image-generation`)
console.log(`Video generation: ${previewUrl}#/content/video-generation`)
console.log(`Shot detail: ${previewUrl}#/content/shots/shot-1-1`)

const child = spawn(process.execPath, [viteBin, 'preview', '--host', host, '--port', String(port), '--strictPort'], {
  cwd: projectRoot,
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
