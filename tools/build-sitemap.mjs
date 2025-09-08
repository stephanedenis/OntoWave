#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function readConfig() {
  for (const base of ['docs', 'public']) {
    try {
      const raw = await fs.readFile(path.join(base, 'config.json'), 'utf8');
      const cfg = JSON.parse(raw);
      const roots = Array.isArray(cfg.roots) ? cfg.roots : [{ base: '/', root: '/content' }];
      return { roots, cfg };
    } catch {}
  }
  return { roots: [{ base: '/', root: '/content' }], cfg: {} };
}

async function extractTitle(p) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    const m = /^(?:\s|\uFEFF)*#\s+(.+)$/m.exec(raw);
    return m ? m[1].trim() : null;
  } catch { return null }
}

function normalizeRelToRoute(rel) {
  const clean = rel.replace(/\\/g, '/');
  // Language suffix: any depth, e.g., demo/mermaid.fr.md -> fr/demo/mermaid
  const m = /^(.*)\.([a-z]{2})\.md$/i.exec(clean)
  if (m) {
    const pathNoExt = m[1]
    const lang = m[2].toLowerCase()
    return `${lang}/${pathNoExt}`
  }
  // Legacy flattened alias: demo.plantuml.md -> demo/plantuml
  if (!clean.includes('/')) {
    const a = /^(?:[\w-]+)\.(?:[\w-]+)\.md$/i.exec(clean)
    if (a) {
      const [section, page] = clean.replace(/\.md$/i, '').split('.')
      return `${section}/${page}`
    }
  }
  return clean.replace(/\.md$/i, '')
}

async function walk(dir, base = dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, base, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      const rel = path.relative(base, p);
      const route = '#/' + normalizeRelToRoute(rel);
      const title = await extractTitle(p);
      acc.push({ path: p, route, title });
    }
  }
  return acc;
}

async function main() {
  const { roots, cfg } = await readConfig();
  let items = [];
  for (const r of roots) {
    try {
      const dir = path.join('docs', r.root.replace(/^\//,''));
      const exist = await fs.stat(dir).then(s => s.isDirectory()).catch(() => false);
      if (!exist) continue;
      const listed = await walk(dir);
      const byKey = new Map();
      const push = (it) => { const k = `${it.route}@@${it.path}`; if (!byKey.has(k)) byKey.set(k, it) };
      for (const it of listed) {
        // If route already starts with a language segment (from suffix), keep as is; else, prefix base as fallback
        const plain = it.route.replace(/^#\//, '');
        const hasLang = /^[a-z]{2}\//i.test(plain);
        const base = r.base === '/' ? '' : String(r.base).replace(/^\/+|\/+$/g, '');
        const withBase = hasLang || !base ? it.route : (`#/` + base + '/' + plain);
        push({ ...it, route: withBase, base: r.base });
      }
      // language-suffixed files at root level are already handled by walk() via normalizeRelToRoute
      items.push(...byKey.values());
    } catch {}
  }
  // Tri simple par chemin
  items.sort((a, b) => a.route.localeCompare(b.route));
  const out = { generatedAt: new Date().toISOString(), count: items.length, i18n: cfg.i18n || null, items };
  await fs.mkdir('docs', { recursive: true });
  await fs.writeFile(path.join('docs', 'sitemap.json'), JSON.stringify(out, null, 2));
  console.log(`sitemap.json generated with ${items.length} items`);
}

main().catch(err => { console.error(err); process.exit(1); });
