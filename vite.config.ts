import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: { port: 5173 },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ['katex'],
          mermaid: ['mermaid'],
          md: ['markdown-it', 'markdown-it-anchor', 'markdown-it-footnote', 'markdown-it-container', 'highlight.js'],
          yaml: ['yaml'],
        },
      },
    },
  },
})
