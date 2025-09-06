#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const read = (p) => fs.readFile(p, 'utf8')
const exists = async (p) => !!(await fs.stat(p).catch(() => null))

function norm(p) {
  return ('/' + p.replace(/^\/+/, '').replace(/\\/g, '/')).replace(/\/{2,}/g, '/')
}

async function collect() {
  const bundle = {}
  // Required: config.json
  if (await exists('public/config.json')) {
    bundle['/config.json'] = await read('public/config.json')
  }
  // Optional aux files
  for (const f of ['sitemap.json', 'nav.yml', 'pages.txt', 'search-index.json']) {
    if (await exists(path.join('public', f))) bundle['/' + f] = await read(path.join('public', f))
  }
  // Content roots from config
  let roots = []
  try {
    const cfg = JSON.parse(bundle['/config.json'] || '{}')
    roots = Array.isArray(cfg.roots) ? cfg.roots : [{ base: '/', root: '/content' }]
  } catch {}
  for (const r of roots) {
    const dir = String(r.root || '').replace(/^\//, '')
    const ok = await exists(dir)
    if (!ok) continue
    await walkContent(dir, bundle)
  }
  return bundle
}

async function walkContent(dir, bundle) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walkContent(p, bundle)
    else if (e.isFile()) {
      const rel = norm(p)
      bundle[rel] = await read(p)
    }
  }
}

async function main() {
  // Ensure regular build exists
  // Build standalone HTML that injects window.__ONTOWAVE_BUNDLE__
  const bundle = await collect()
  await fs.mkdir('docs/standalone', { recursive: true })
    let html = await read('docs/index.html').catch(() => read('index.html'))
    const inject = `\n<script>window.__ONTOWAVE_BUNDLE__ = ${JSON.stringify(bundle)};</script>\n`
    // Rewrite absolute asset URLs to relative (file:// compatibility)
    // /assets/...  -> ../assets/...
    html = html.replace(/(src|href)=(\"|')\/(assets\/[^\"']+)(\2)/g, (_, a1, q, p, q2) => `${a1}=${q}../${p}${q2}`)
    // Inject bundle before first module script or before </head>
    if (/<script[^>]*type=\"module\"/i.test(html)) {
      // Also rewrite the src if it's absolute
      html = html.replace(/<script([^>]*?)type=\"module\"([^>]*?)src=\"\/(.*?)\"/i, '<script$1type="module"$2src="../$3"')
      html = html.replace(/<script[^>]*type=\"module\"/i, (m) => inject + m)
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${inject}</head>`)
    } else {
      html = inject + html
    }
    await fs.writeFile('docs/standalone/index.html', html, 'utf8')
  console.log(`Standalone build ready: docs/standalone/index.html (entries: ${Object.keys(bundle).length})`)
}

main().catch(err => { console.error(err); process.exit(1) })
