import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, 'dist')
const indexPath = path.join(distDir, 'index.html')

const resolveDistAssetPath = (assetPath) => {
  if (assetPath.startsWith('/')) {
    return path.join(distDir, assetPath.slice(1))
  }
  return path.resolve(distDir, assetPath)
}

const escapeInlineScript = (content) => content.replace(/<\/script/gi, '<\\/script')
const escapeInlineStyle = (content) => content.replace(/<\/style/gi, '<\\/style')

let html = await fs.readFile(indexPath, 'utf8')

html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '')
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, '')
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]+" rel="stylesheet">\s*/g, '')

const faviconMatch = html.match(/<link rel="icon"[^>]*href="([^"]+)"[^>]*>/)
if (faviconMatch) {
  const faviconPath = resolveDistAssetPath(faviconMatch[1])
  const faviconSvg = await fs.readFile(faviconPath, 'utf8')
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`
  html = html.replace(faviconMatch[0], () => `<link rel="icon" type="image/svg+xml" href="${faviconDataUrl}" />`)
}

const stylesheetMatches = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]
for (const match of stylesheetMatches) {
  const cssPath = resolveDistAssetPath(match[1])
  const css = escapeInlineStyle(await fs.readFile(cssPath, 'utf8'))
  html = html.replace(match[0], () => `<style data-inline-href="${match[1]}">\n${css}\n</style>`)
}

const scriptMatches = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)]
for (const match of scriptMatches) {
  const jsPath = resolveDistAssetPath(match[1])
  const js = escapeInlineScript(await fs.readFile(jsPath, 'utf8'))
  html = html.replace(match[0], () => `<script type="module" data-inline-src="${match[1]}">\n${js}\n</script>`)
}

await fs.writeFile(indexPath, html)
