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
