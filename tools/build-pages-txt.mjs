#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

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
  const files = await walk('docs')
  const lines = [...new Set(files.map(file => '/' + path.relative('docs', file).replace(/\\/g, '/')))]
  await fs.mkdir('docs', { recursive: true })
  await fs.writeFile(path.join('docs', 'pages.txt'), lines.sort().join('\n'))
  console.log(`pages.txt generated with ${lines.length} entries`)
}

main().catch(err => { console.error(err); process.exit(1) })
