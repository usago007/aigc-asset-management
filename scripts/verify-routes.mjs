import { execFile, spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = resolve(import.meta.dirname, '..')
const host = '127.0.0.1'
const port = 4199
const debugPort = 9339
const baseUrl = `http://${host}:${port}/`
const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const updateBaseline = process.env.UPDATE_UI_BASELINE === '1'
const baselineDir = join(root, 'artifacts', 'ui-baseline')
const baselineRoutes = new Map([
  ['/content/image-generation', 'image-generation-light.png'],
  ['/projects/projects', 'projects-light.png'],
  ['/dashboard/overview', 'dashboard-overview-light.png'],
  ['/system/ai-config', 'ai-config-light.png'],
  ['/content/image-detail/image-task-1-1-opening/0', 'image-detail-light.png'],
])
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'google-chrome',
  'chromium',
].filter(Boolean)

const routes = [
  '/content/image-generation', '/content/video-generation', '/content/assets', '/content/shots',
  '/projects/customers', '/projects/brands', '/projects/projects', '/projects/briefs', '/projects/tasks', '/projects/reviews',
  '/dashboard/overview', '/dashboard/generation', '/dashboard/assets', '/dashboard/tasks',
  '/system/members', '/system/roles', '/system/settings', '/system/ai-config', '/system/logs',
  '/projects/projects/project-1', '/content/shots/shot-1-1', '/content/task/video-task-1-1',
  '/content/video-detail/video-task-1-1', '/content/image-detail/image-task-1-1-opening/0', '/route-that-does-not-exist',
]

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms))
const server = spawn(process.execPath, [viteBin, 'preview', '--host', host, '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
})
const profileDir = await mkdtemp(join(tmpdir(), 'fatmug-route-check-'))
let chromeProcess = null
let cdpSocket = null

const findChrome = async () => {
  for (const candidate of chromeCandidates) {
    try {
      await execFileAsync(candidate, ['--version'])
      return candidate
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error('未找到可用的 Chrome/Chromium。可通过 CHROME_PATH 指定浏览器。')
}

try {
  let ready = false
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) { ready = true; break }
    } catch {
      // Preview is still starting.
    }
    await sleep(100)
  }
  if (!ready) throw new Error('构建预览未在预期时间内启动')

  const chrome = await findChrome()
  chromeProcess = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--disable-background-networking', '--disable-component-update',
    '--disable-default-apps', '--disable-extensions', '--disable-sync', '--no-first-run', '--no-default-browser-check',
    '--blink-settings=imagesEnabled=false', `--user-data-dir=${profileDir}`, '--window-size=1280,800',
    `--remote-debugging-port=${debugPort}`, 'about:blank',
  ], { stdio: 'ignore' })

  let pageTarget = null
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await fetch(`http://${host}:${debugPort}/json/list`).then((response) => response.json())
      pageTarget = targets.find((target) => target.type === 'page') || null
      if (pageTarget?.webSocketDebuggerUrl) break
    } catch {
      // Chrome DevTools is still starting.
    }
    await sleep(100)
  }
  if (!pageTarget?.webSocketDebuggerUrl) throw new Error('无法连接 Chrome DevTools')

  cdpSocket = new WebSocket(pageTarget.webSocketDebuggerUrl)
  await new Promise((resolvePromise, reject) => {
    cdpSocket.addEventListener('open', resolvePromise, { once: true })
    cdpSocket.addEventListener('error', reject, { once: true })
  })
  let messageId = 0
  const pending = new Map()
  cdpSocket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id || !pending.has(message.id)) return
    const { resolve: resolvePending, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolvePending(message.result)
  })
  const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
    const id = ++messageId
    pending.set(id, { resolve: resolvePromise, reject })
    cdpSocket.send(JSON.stringify({ id, method, params }))
  })
  await send('Page.enable')
  await send('Runtime.enable')

  const failures = []
  const baselineManifest = []
  if (updateBaseline) await mkdir(baselineDir, { recursive: true })
  for (const [index, route] of routes.entries()) {
    await send('Page.navigate', { url: `${baseUrl}?route-check=${index}#${route}` })
    let state = null
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const evaluated = await send('Runtime.evaluate', {
        expression: `(() => ({ main: Boolean(document.querySelector('#main-content')), heading: document.querySelector('h1')?.textContent?.trim() || '', body: document.body?.innerText || '', overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))()`,
        returnByValue: true,
      })
      state = evaluated.result.value
      if (state?.main && state?.heading) break
      await sleep(100)
    }
    const hasMain = Boolean(state?.main)
    const hasHeading = Boolean(state?.heading)
    const isExpected404 = route === '/route-that-does-not-exist' && state?.body.includes('这个坐标')
    if (!hasMain || !hasHeading || (route === '/route-that-does-not-exist' && !isExpected404)) {
      failures.push(`${route}: main=${hasMain}, h1=${hasHeading}, expected404=${isExpected404}, overflow=${state?.overflow}`)
    }
    if (updateBaseline && baselineRoutes.has(route)) {
      const file = baselineRoutes.get(route)
      const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
      await writeFile(join(baselineDir, file), Buffer.from(screenshot.data, 'base64'))
      baselineManifest.push({ route, file, theme: 'light', viewport: '1280x800', heading: state?.heading })
    }
  }

  if (updateBaseline) {
    await send('Runtime.evaluate', { expression: `localStorage.setItem('theme', 'dark')` })
    await send('Page.navigate', { url: `${baseUrl}?route-check=dark#/dashboard/overview` })
    await sleep(500)
    const darkScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(join(baselineDir, 'dashboard-overview-dark.png'), Buffer.from(darkScreenshot.data, 'base64'))
    baselineManifest.push({ route: '/dashboard/overview', file: 'dashboard-overview-dark.png', theme: 'dark', viewport: '1280x800' })

    await send('Runtime.evaluate', { expression: `localStorage.setItem('theme', 'light')` })
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 800, deviceScaleFactor: 1, mobile: false })
    await send('Page.navigate', { url: `${baseUrl}?route-check=mobile#/projects/projects` })
    await sleep(500)
    const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(join(baselineDir, 'projects-mobile-light.png'), Buffer.from(mobileScreenshot.data, 'base64'))
    baselineManifest.push({ route: '/projects/projects', file: 'projects-mobile-light.png', theme: 'light', viewport: '768x800' })
    await send('Emulation.clearDeviceMetricsOverride')
    await writeFile(join(baselineDir, 'manifest.json'), `${JSON.stringify(baselineManifest, null, 2)}\n`)
    console.log(`UI baseline updated: ${baselineManifest.length} screenshots`)
  }

  if (failures.length) {
    console.error(`Route verification failed (${failures.length})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log(`Route verification passed: ${routes.length} rendered routes`)
  }
} finally {
  cdpSocket?.close()
  chromeProcess?.kill('SIGTERM')
  server.kill('SIGTERM')
  await rm(profileDir, { recursive: true, force: true })
}
