import { defineConfig } from 'vite'
import path from 'path'
import pkg from './package.json'

// Build configuration for dist/ package distribution
// Produit dist/ontowave.js — noyau léger (<seuil actif documenté dans roadmap.fr.md §1)
// Les dépendances lourdes (markdown-it, mermaid, highlight.js) vivent dans dist/extensions/
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'OntoWave',
      fileName: () => 'ontowave.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // inlineDynamicImports est ignoré par Rollup pour le format IIFE
        // (codeSplitting est automatiquement désactivé pour IIFE)
        // Les imports d'extensions utilisent new Function('u','return import(u)')
        // pour échapper le traitement Rollup — ils ne sont PAS inline dans le noyau.
        entryFileNames: 'ontowave.js',
        assetFileNames: 'ontowave.[ext]'
      }
    }
  }
})

