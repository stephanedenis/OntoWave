import { defineConfig } from 'vite'
import path from 'path'
import pkg from './package.json'

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist/extensions',
    emptyOutDir: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        markdown: path.resolve(__dirname, 'src/extensions/markdown.ts'),
        mermaid: path.resolve(__dirname, 'src/extensions/mermaid.ts'),
        katex: path.resolve(__dirname, 'src/extensions/katex.ts'),
        highlight: path.resolve(__dirname, 'src/extensions/highlight.ts'),
        plantuml: path.resolve(__dirname, 'src/extensions/plantuml.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
