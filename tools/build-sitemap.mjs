#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function readConfig() {
  try {
    const raw = await fs.readFile(path.join('public', 'config.json'), 'utf8');
    const cfg = JSON.parse(raw);
    const roots = Array.isArray(cfg.roots) ? cfg.roots : [{ base: '/', root: '/content' }];
    return roots;
  } catch {
    return [{ base: '/', root: '/content' }];
  }
}

async function extractTitle(p) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    const m = /^(?:\s|\uFEFF)*#\s+(.+)$/m.exec(raw);
    return m ? m[1].trim() : null;
  } catch { return null }
}

async function walk(dir, base = dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, base, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      const rel = path.relative(base, p);
      const route = '#/' + rel.replace(/\\.md$/i, '').replace(/\\\\/g, '/');
      const title = await extractTitle(p);
      acc.push({ path: p, route, title });
    }
  }
  return acc;
}

async function main() {
  const roots = await readConfig();
  let items = [];
  for (const r of roots) {
    try {
      const dir = r.root.replace(/^\//,'');
      const exist = await fs.stat(dir).then(s => s.isDirectory()).catch(() => false);
      if (!exist) continue;
      const listed = await walk(dir);
      items = items.concat(listed);
    } catch {}
  }
  // Tri simple par chemin
  items.sort((a, b) => a.route.localeCompare(b.route));
  const out = { generatedAt: new Date().toISOString(), count: items.length, items };
  await fs.mkdir('public', { recursive: true });
  await fs.writeFile(path.join('public', 'sitemap.json'), JSON.stringify(out, null, 2));
  console.log(`sitemap.json generated with ${items.length} items`);
}

main().catch(err => { console.error(err); process.exit(1); });
