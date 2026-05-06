#!/usr/bin/env node
/**
 * inject-noscript.mjs
 *
 * Pour chaque fichier HTML dans docs/, génère un bloc <noscript> contenant
 * le rendu HTML des fichiers Markdown associés (.fr.md / .en.md).
 *
 * Permet aux crawlers sans JavaScript d'indexer le contenu malgré la
 * navigation hash-based d'OntoWave.
 *
 * Stratégie de détection : {dir}/{basename}.{lang}.md
 *   docs/index.html             → docs/index.fr.md + docs/index.en.md
 *   docs/demos/index.html       → docs/demos/index.fr.md + docs/demos/index.en.md
 *   docs/demos/01-base/markdown.html → docs/demos/01-base/markdown.fr.md + ...
 *
 * Idempotent : si le marqueur <!-- noscript:seo:start --> existe déjà,
 * le bloc est remplacé (pas dupliqué).
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'docs');

const MARKER_START = '<!-- noscript:seo:start -->';
const MARKER_END   = '<!-- noscript:seo:end -->';

function createMd() {
  return new MarkdownIt({ html: true, linkify: true, typographer: true });
}

async function findHtmlFiles(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await findHtmlFiles(p, acc);
    else if (e.isFile() && e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

async function findMarkdownFiles(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await findMarkdownFiles(p, acc);
    else if (e.isFile() && e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

function extractTitle(mdSource, fallback) {
  const line = mdSource.split(/\r?\n/).find((l) => /^#\s+/.test(l.trim()));
  if (!line) return fallback;
  return line.replace(/^#\s+/, '').trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildTree(items) {
  const root = { folders: new Map(), files: [] };
  for (const item of items) {
    const parts = item.path.split('/');
    const file = parts.pop();
    let node = root;
    for (const part of parts) {
      if (!node.folders.has(part)) node.folders.set(part, { folders: new Map(), files: [] });
      node = node.folders.get(part);
    }
    node.files.push({ ...item, file });
  }
  return root;
}

function renderTree(node) {
  const folderNames = [...node.folders.keys()].sort((a, b) => a.localeCompare(b));
  const files = [...node.files].sort((a, b) => a.path.localeCompare(b.path));
  const parts = [];
  if (folderNames.length > 0) {
    for (const name of folderNames) {
      const child = node.folders.get(name);
      parts.push(`<li>${escapeHtml(name)}${renderTree(child)}</li>`);
    }
  }
  if (files.length > 0) {
    for (const f of files) {
      const href = `/${f.path}`;
      parts.push(`<li><a href="${escapeHtml(href)}">${escapeHtml(f.title)}</a></li>`);
    }
  }
  return `<ul>${parts.join('')}</ul>`;
}

async function buildHomepageNoscript() {
  const mdFiles = await findMarkdownFiles(docsDir);
  const entries = [];
  for (const filePath of mdFiles) {
    const rel = relative(docsDir, filePath).replace(/\\/g, '/');
    const raw = await readFile(filePath, 'utf8');
    const fallback = basename(filePath, '.md');
    entries.push({ path: rel, title: extractTitle(raw, fallback) });
  }

  const tree = buildTree(entries);
  const treeHtml = renderTree(tree);

  return [
    '  <div lang="fr">',
    '    <h1>OntoWave</h1>',
    '    <p>OntoWave est une bibliothèque JavaScript de navigation documentaire pour sites statiques, avec routage hash-based, rendu Markdown et support multilingue.</p>',
    '    <p>CDN : <a href="https://unpkg.com/ontowave/dist/ontowave.min.js">https://unpkg.com/ontowave/dist/ontowave.min.js</a></p>',
    '    <h2>Arborescence des pages Markdown crawlables</h2>',
    `    ${treeHtml}`,
    '  </div>'
  ].join('\n');
}

function stripMath(src) {
  // Supprime les blocs LaTeX $$...$$  et formules inline $...$
  // car la syntaxe brute nuit à la lisibilité pour les crawlers
  return src
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$\n]+\$/g, '');
}

async function processHtml(htmlPath, md) {
  const dir = dirname(htmlPath);
  const name = basename(htmlPath, '.html');
  const relPath = relative(docsDir, htmlPath);

  const blocks = [];
  const isHomepage = relPath === 'index.html';

  if (isHomepage) {
    let html = await readFile(htmlPath, 'utf8');
    const innerBlocks = await buildHomepageNoscript();
    const noscriptBlock =
      `${MARKER_START}\n<noscript>\n${innerBlocks}\n</noscript>\n${MARKER_END}`;

    if (html.includes(MARKER_START)) {
      html = html.replace(
        new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`),
        noscriptBlock
      );
    } else {
      html = html.replace('</body>', `\n${noscriptBlock}\n</body>`);
    }

    await writeFile(htmlPath, html, 'utf8');
    console.log(`  ✅ ${relPath} [homepage-tree]`);
    return true;
  }

  for (const lang of ['fr', 'en']) {
    const mdPath = join(dir, `${name}.${lang}.md`);
    if (existsSync(mdPath)) {
      const raw = await readFile(mdPath, 'utf8');
      const rendered = md.render(stripMath(raw));
      blocks.push({ lang, content: rendered });
    }
  }

  if (blocks.length === 0) return false;

  let html = await readFile(htmlPath, 'utf8');

  const innerBlocks = blocks
    .map(({ lang, content }) => `  <div lang="${lang}">\n${content}  </div>`)
    .join('\n');

  const noscriptBlock =
    `${MARKER_START}\n<noscript>\n${innerBlocks}\n</noscript>\n${MARKER_END}`;

  if (html.includes(MARKER_START)) {
    html = html.replace(
      new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`),
      noscriptBlock
    );
  } else {
    html = html.replace('</body>', `\n${noscriptBlock}\n</body>`);
  }

  await writeFile(htmlPath, html, 'utf8');
  console.log(`  ✅ ${relPath} [${blocks.map(b => b.lang).join(', ')}]`);
  return true;
}

async function main() {
  console.log('🔍 inject-noscript: enrichissement SEO des pages HTML...');
  const md = createMd();
  const htmlFiles = await findHtmlFiles(docsDir);

  let count = 0;
  for (const f of htmlFiles) {
    if (await processHtml(f, md)) count++;
  }

  console.log(`✅ ${count}/${htmlFiles.length} fichiers HTML enrichis avec <noscript>`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
