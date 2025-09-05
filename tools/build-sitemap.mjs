#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function readConfig() {
  try {
    const raw = await fs.readFile(path.join('public', 'config.json'), 'utf8');
    const cfg = JSON.parse(raw);
    const roots = Array.isArray(cfg.contentRoots) ? cfg.contentRoots : (cfg.contentRoot ? [cfg.contentRoot] : ['content']);
    return roots;
  } catch {
    return ['content'];
  }
}

async function walk(dir, base = dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, base, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      const rel = path.relative(base, p);
      const route = '#/' + rel.replace(/\\.md$/i, '').replace(/\\\\/g, '/');
      acc.push({ path: p, route });
    }
  }
  return acc;
}

async function main() {
  const roots = await readConfig();
  let items = [];
  for (const r of roots) {
    try {
      const exist = await fs.stat(r).then(s => s.isDirectory()).catch(() => false);
      if (!exist) continue;
      const listed = await walk(r);
      items = items.concat(listed);
    } catch {}
  }
  const out = { generatedAt: new Date().toISOString(), count: items.length, items };
  await fs.mkdir('public', { recursive: true });
  await fs.writeFile(path.join('public', 'sitemap.json'), JSON.stringify(out, null, 2));
  console.log(`sitemap.json generated with ${items.length} items`);
}

main().catch(err => { console.error(err); process.exit(1); });
