import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const failures = []
const assert = (condition, message) => { if (!condition) failures.push(message) }

const app = read('src/App.tsx')
const layout = read('src/components/Layout.tsx')
const index = read('index.html')
const allSourcePaths = [
  'src/App.tsx',
  'src/components/JimengInput.tsx',
  'src/components/ImageCreationWorkspace.tsx',
  'src/components/VideoCreationWorkspace.tsx',
  'src/pages/content/Assets.tsx',
  'src/pages/content/ImageDetail.tsx',
  'src/pages/content/KeyFrames.tsx',
  'src/pages/content/Shots.tsx',
  'src/pages/content/VideoDetail.tsx',
  'src/pages/projects/Brands.tsx',
  'src/pages/projects/Briefs.tsx',
  'src/pages/projects/Customers.tsx',
  'src/pages/projects/ProjectDetail.tsx',
  'src/pages/projects/Projects.tsx',
  'src/pages/projects/Reviews.tsx',
  'src/pages/projects/Tasks.tsx',
]
const allSource = allSourcePaths.map(read).join('\n')

assert((app.match(/<Route\s+path=/g) || []).length >= 28, '路由覆盖数低于预期')
assert(app.includes('path="*" element={<NotFound />}'), '缺少自定义 404 路由')
assert(layout.includes('href="#main-content"'), '缺少跳到主要内容链接')
assert(layout.includes('id="main-content"'), '主要内容缺少稳定焦点目标')
assert(layout.includes('aria-label="移动端导航"'), '缺少移动端导航对话框语义')
assert(index.includes('name="description"'), '缺少页面 description 元信息')
assert(index.includes('property="og:title"'), '缺少 Open Graph 标题')
assert(!/window\.(confirm|alert)\s*\(/.test(allSource), '仍存在浏览器原生确认或警告框')
assert(!/alt=""/.test(allSource), '仍存在空图片替代文本')
assert(!/href="#"/.test(allSource), '仍存在无目标链接')
assert(!/即将开放|分享功能即将开放/.test(allSource), '仍存在面向用户的占位功能')

const primaryPages = [
  'src/pages/content/Assets.tsx',
  'src/pages/content/ImageGeneration.tsx',
  'src/pages/content/KeyFrames.tsx',
  'src/pages/content/Shots.tsx',
  'src/pages/content/VideoGeneration.tsx',
  'src/pages/projects/Brands.tsx',
  'src/pages/projects/Briefs.tsx',
  'src/pages/projects/Customers.tsx',
  'src/pages/projects/Projects.tsx',
  'src/pages/projects/Reviews.tsx',
  'src/pages/projects/Tasks.tsx',
  'src/pages/system/AIConfigPanel.tsx',
  'src/pages/system/Members.tsx',
  'src/pages/system/Roles.tsx',
  'src/pages/system/Settings.tsx',
  'src/pages/system/SystemLogs.tsx',
]

for (const path of primaryPages) {
  const source = read(path)
  assert(source.includes('<PageIntro'), `${path} 缺少统一页面标题区`)
  assert(source.includes('description='), `${path} 缺少页面用途说明`)
}

if (failures.length) {
  console.error(`UI contract failed (${failures.length})`)
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`UI contract passed: ${primaryPages.length} primary pages, ${(app.match(/<Route\s+path=/g) || []).length} routes`)
