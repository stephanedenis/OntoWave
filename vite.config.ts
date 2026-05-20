import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
  base: '/',
  server: { port: 5173 },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id: string): string | undefined => {
          if (id.includes('katex')) return 'katex'
          if (id.includes('mermaid')) return 'mermaid'
          if (['markdown-it', 'markdown-it-anchor', 'markdown-it-footnote', 'markdown-it-container', 'highlight.js'].some(p => id.includes(p))) return 'md'
          if (id.includes('yaml')) return 'yaml'
          return undefined
        },
      },
    },
  },
})
