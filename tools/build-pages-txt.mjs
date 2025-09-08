#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

async function readConfig() {
  // Prefer docs/config.json when serving built site; fallback to public/config.json
  for (const base of ['docs', 'public']) {
    try {
      const raw = await fs.readFile(path.join(base, 'config.json'), 'utf8')
      const cfg = JSON.parse(raw)
      const roots = Array.isArray(cfg.roots) ? cfg.roots : [{ base: '/', root: '/content' }]
      return { roots, baseDir: base }
    } catch {}
  }
  return { roots: [{ base: '/', root: '/content' }], baseDir: 'docs' }
}

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, acc)
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) acc.push(p)
  }
  return acc
}

async function main() {
  const { roots } = await readConfig()
  const lines = []
  for (const r of roots) {
    const dir = path.join('docs', String(r.root || '').replace(/^\//, ''))
    const exists = await fs.stat(dir).then(s => s.isDirectory()).catch(() => false)
    if (!exists) continue
    const files = await walk(dir)
    const base = (r.base && r.base !== '/') ? String(r.base).replace(/^\/+|\/+$/g, '') : ''
    for (const f of files) {
      const relRaw = path.relative(dir, f).replace(/\\/g, '/')
      const rel = (() => {
        // Language suffix: any depth e.g., demo/mermaid.fr.md -> fr/demo/mermaid.md
        const m = /^(.*)\.([a-z]{2})\.md$/i.exec(relRaw)
        if (m) return `${m[2].toLowerCase()}/${m[1]}.md`
        // Legacy alias: demo.plantuml.md -> demo/plantuml.md
        if (!relRaw.includes('/')) {
          const a = /^(?:[\w-]+)\.(?:[\w-]+)\.md$/i.exec(relRaw)
          if (a) return relRaw.replace(/\./, '/')
        }
        return relRaw
      })()
      const line = base ? (rel.startsWith(base + '/') ? rel : `${base}/${rel}`) : rel
      lines.push(line)
    }
  }
  // No extra global alias scan needed; suffix form is already captured
  await fs.mkdir('docs', { recursive: true })
  await fs.writeFile(path.join('docs', 'pages.txt'), lines.sort().join('\n'))
  console.log(`pages.txt generated with ${lines.length} entries`)
}

main().catch(err => { console.error(err); process.exit(1) })
