import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, 'dist')
const indexPath = path.join(distDir, 'index.html')

const viteConfigSrc = await fs.readFile(path.join(projectRoot, 'vite.config.ts'), 'utf8')
const viteBase = viteConfigSrc.match(/base\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] ?? '/'

const stripBase = (assetPath) => {
  if (viteBase !== '/' && viteBase !== './' && assetPath.startsWith(viteBase)) {
    return '/' + assetPath.slice(viteBase.length)
  }
  return assetPath
}

const resolveDistAssetPath = (assetPath) => {
  const stripped = stripBase(assetPath)
  if (stripped.startsWith('/')) {
    return path.join(distDir, stripped.slice(1))
  }
  return path.resolve(distDir, stripped)
}

const escapeInlineScript = (content) => content.replace(/<\/script/gi, '<\\/script')
const escapeInlineStyle = (content) => content.replace(/<\/style/gi, '<\\/style')
const normalizeWebDir = (value) => value.replace(/\\/g, '/').replace(/^\.\//, '')
const isRelativeSpecifier = (specifier) => specifier.startsWith('./') || specifier.startsWith('../')
const rebaseRelativeSpecifier = (specifier, assetSrc) => {
  if (!isRelativeSpecifier(specifier)) return specifier
  const strippedSrc = stripBase(assetSrc)
  const assetDir = path.posix.dirname(normalizeWebDir(strippedSrc))
  if (!assetDir || assetDir === '.') return specifier
  const rebased = path.posix.normalize(path.posix.join(assetDir, specifier))
  return rebased.startsWith('.') ? rebased : `./${rebased}`
}

const rebaseInlineModuleImports = (content, scriptSrc) => {
  return content
    .replace(/(from\s*['"])(\.{1,2}\/[^'"]+)(['"])/g, (_, prefix, specifier, suffix) => {
      return `${prefix}${rebaseRelativeSpecifier(specifier, scriptSrc)}${suffix}`
    })
    .replace(/(import\s*['"])(\.{1,2}\/[^'"]+)(['"])/g, (_, prefix, specifier, suffix) => {
      return `${prefix}${rebaseRelativeSpecifier(specifier, scriptSrc)}${suffix}`
    })
    .replace(/(import\s*\(\s*['"])(\.{1,2}\/[^'"]+)(['"]\s*\))/g, (_, prefix, specifier, suffix) => {
      return `${prefix}${rebaseRelativeSpecifier(specifier, scriptSrc)}${suffix}`
    })
    .replace(/(new\s+URL\s*\(\s*['"])(\.{1,2}\/[^'"]+)(['"]\s*,\s*import\.meta\.url\s*\))/g, (_, prefix, specifier, suffix) => {
      return `${prefix}${rebaseRelativeSpecifier(specifier, scriptSrc)}${suffix}`
    })
}

const rebaseInlineCssUrls = (content, cssSrc) =>
  content.replace(/url\((['"]?)([^'")]+)\1\)/g, (full, quote, assetPath) => {
    if (!isRelativeSpecifier(assetPath) || assetPath.startsWith('data:')) return full
    const rebased = rebaseRelativeSpecifier(assetPath, cssSrc)
    return `url(${quote}${rebased}${quote})`
  })

const ensureInlineReferencesResolvable = async (content, assetSrc, patterns, kind) => {
  const references = []
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      references.push(match[1])
    }
  }

  for (const ref of references) {
    if (!isRelativeSpecifier(ref)) continue
    const resolved = resolveDistAssetPath(ref)
    try {
      await fs.access(resolved)
    } catch {
      throw new Error(`${kind} 内联后仍引用了不存在的资源: ${ref} (来源: ${assetSrc})`)
    }
  }
}

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
  const rawCss = await fs.readFile(cssPath, 'utf8')
  const rebasedCss = rebaseInlineCssUrls(rawCss, match[1])
  await ensureInlineReferencesResolvable(rebasedCss, match[1], [/url\((?:['"]?)(\.{1,2}\/[^'")]+)(?:['"]?)\)/g], 'CSS')
  const css = escapeInlineStyle(rebasedCss)
  html = html.replace(match[0], () => `<style data-inline-href="${match[1]}">\n${css}\n</style>`)
}

const scriptMatches = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)]
for (const match of scriptMatches) {
  const jsPath = resolveDistAssetPath(match[1])
  const rawJs = await fs.readFile(jsPath, 'utf8')
  const rebasedJs = rebaseInlineModuleImports(rawJs, match[1])
  await ensureInlineReferencesResolvable(
    rebasedJs,
    match[1],
    [
      /from\s*['"](\.{1,2}\/[^'"]+)['"]/g,
      /import\s*['"](\.{1,2}\/[^'"]+)['"]/g,
      /import\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
      /new\s+URL\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g,
    ],
    'JS',
  )
  const js = escapeInlineScript(rebasedJs)
  html = html.replace(match[0], () => `<script type="module" data-inline-src="${match[1]}">\n${js}\n</script>`)
}

await fs.writeFile(indexPath, html)
