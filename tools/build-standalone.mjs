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
  // Ensure module script path remains valid in standalone
  // Use the same index.html but with injected bundle before the module script
  html = html.replace(/<script type="module" src="[^"]+"><\/script>/, (m) => inject + m)
  await fs.writeFile('docs/standalone/index.html', html, 'utf8')
  console.log(`Standalone build ready: docs/standalone/index.html (entries: ${Object.keys(bundle).length})`)
}

main().catch(err => { console.error(err); process.exit(1) })
