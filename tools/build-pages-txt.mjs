#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

async function readConfig() {
  try {
    const raw = await fs.readFile(path.join('public', 'config.json'), 'utf8')
    const cfg = JSON.parse(raw)
    const roots = Array.isArray(cfg.roots) ? cfg.roots : [{ base: '/', root: '/content' }]
    return { roots }
  } catch {
    return { roots: [{ base: '/', root: '/content' }] }
  }
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
    const dir = String(r.root || '').replace(/^\//, '')
    const exists = await fs.stat(dir).then(s => s.isDirectory()).catch(() => false)
    if (!exists) continue
    const files = await walk(dir)
    const base = (r.base && r.base !== '/') ? String(r.base).replace(/^\/+|\/+$/g, '') : ''
    for (const f of files) {
      const rel = path.relative(dir, f).replace(/\\/g, '/')
      const line = base ? `${base}/${rel}` : rel
      lines.push(line)
    }
  }
  await fs.writeFile(path.join('public', 'pages.txt'), lines.sort().join('\n'))
  console.log(`pages.txt generated with ${lines.length} entries`)
}

main().catch(err => { console.error(err); process.exit(1) })
