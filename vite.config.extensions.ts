/**
 * Configuration Vite — Build des extensions OntoWave
 *
 * Produit deux fichiers ESM autonomes dans dist/extensions/ :
 *   - markdown.js  (markdown-it + highlight.js + KaTeX + plugins)
 *   - mermaid.js   (Mermaid — toutes dépendances inline)
 *
 * Chaque extension est un fichier ESM auto-suffisant (pas de chunks externes)
 * pouvant être chargé via `import(url)` depuis n'importe quel contexte.
 *
 * Usage :
 *   npm run build:ext:markdown   → dist/extensions/markdown.js
 *   npm run build:ext:mermaid    → dist/extensions/mermaid.js
 *   npm run build:extensions     → les deux
 */

import { defineConfig } from 'vite'
import path from 'path'

type ExtName = 'markdown' | 'mermaid'

export default defineConfig(({ mode }) => {
  const ext = (mode || 'markdown') as ExtName
  return {
    publicDir: false, // ne pas copier public/ dans dist/extensions/
    build: {
      outDir: 'dist/extensions',
      emptyOutDir: ext === 'markdown', // vide seulement au premier build
      lib: {
        entry: path.resolve(__dirname, `src/extensions/${ext}.ts`),
        formats: ['es'] as ['es'],
        fileName: () => `${ext}.js`,
      },
      rollupOptions: {
        // Aucune dépendance externe — tout est inline dans le fichier ESM
        external: [],
        output: {
          // Force tout le code dans un unique fichier ESM (pas de chunks)
          inlineDynamicImports: true,
        },
      },
    },
  }
})

