import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const requiredFiles = [
  'dist/index.html',
  'dist/blog/index.html',
  'dist/blog/learn-claude-code/index.html',
  'dist/about/index.html',
  'dist/contact/index.html',
  'dist/search/index.html',
  'dist/rss.xml',
  'dist/robots.txt'
]

const forbiddenFragments = [
  '/links',
  '/talks',
  '/projects',
  'DevMode',
  'joye:toggle-dev',
  'Joye Personal Blog'
]

const missing = requiredFiles.filter((file) => !existsSync(file))
if (missing.length > 0) {
  console.error(`Missing build files:\n${missing.join('\n')}`)
  process.exit(1)
}

const collectHtmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectHtmlFiles(path)
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : []
  })

const collectCssFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectCssFiles(path)
    return entry.isFile() && entry.name.endsWith('.css') ? [path] : []
  })

const htmlFiles = collectHtmlFiles('dist')
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  for (const fragment of forbiddenFragments) {
    if (html.includes(fragment)) {
      console.error(`Forbidden fragment "${fragment}" found in ${file}`)
      process.exit(1)
    }
  }
}

const home = readFileSync(join('dist', 'index.html'), 'utf8')
if (!home.includes('COOLAI')) {
  console.error('Home page does not contain COOLAI')
  process.exit(1)
}
if (!home.includes('learn-claude-code s20')) {
  console.error('Home page does not contain the learn-claude-code article')
  process.exit(1)
}

const requiredHtmlFragments = [
  ['dist/index.html', 'data-polish="home-hero"'],
  ['dist/blog/learn-claude-code/index.html', 'learn-claude-code s20'],
  ['dist/blog/coolai-start/index.html', 'data-polish="article-hero"'],
  ['dist/about/index.html', 'data-polish="about-focus"'],
  ['dist/contact/index.html', 'data-polish="contact-stack"']
]
for (const [file, fragment] of requiredHtmlFragments) {
  const html = readFileSync(file, 'utf8')
  if (!html.includes(fragment)) {
    console.error(`Missing HTML fragment "${fragment}" in ${file}`)
    process.exit(1)
  }
}

const rss = readFileSync(join('dist', 'rss.xml'), 'utf8')
if (!rss.includes('learn-claude-code s20')) {
  console.error('RSS feed does not contain the learn-claude-code article')
  process.exit(1)
}

const css = collectCssFiles('dist').map((file) => readFileSync(file, 'utf8')).join('\n')
const requiredCssSelectors = [
  '.max-w-5xl',
  '.text-3xl',
  '.bg-background',
  '.prose',
  '.coolai-surface',
  '.coolai-hero-mark',
  '.coolai-post-card',
  '.coolai-article-hero',
  '.prose h2',
  '.prose strong',
  '.prose code:not(pre code)'
]
const missingCssSelectors = requiredCssSelectors.filter((selector) => !css.includes(selector))
if (missingCssSelectors.length > 0) {
  console.error(`Missing generated CSS selectors:\n${missingCssSelectors.join('\n')}`)
  process.exit(1)
}

const requiredCssFragments = [
  '--background: 200 72% 98%',
  '.dark{--background: 200 72% 98%',
  'background:linear-gradient(135deg,#ddf8fef2,#fcfcfd 38%,#fff 64%,#effbf8)',
  'backdrop-filter:blur(18px)'
]
const missingCssFragments = requiredCssFragments.filter((fragment) => !css.includes(fragment))
if (missingCssFragments.length > 0) {
  console.error(`Missing generated CSS fragments:\n${missingCssFragments.join('\n')}`)
  process.exit(1)
}

console.log('dist verification passed')
