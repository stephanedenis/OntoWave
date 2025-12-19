import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isPluginMode = mode === 'plugins'
  
  return {
    base: '/',
    server: { port: 5173 },
    build: {
      outDir: isPluginMode ? 'dist-plugins' : 'public-demo',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: isPluginMode 
          ? resolve(__dirname, 'src/main-with-plugins.ts')
          : resolve(__dirname, 'index.html'),
        output: {
          entryFileNames: isPluginMode ? 'ontowave-with-plugins.js' : 'assets/[name]-[hash].js',
          manualChunks: isPluginMode ? undefined : {
            katex: ['katex'],
            mermaid: ['mermaid'],
            md: ['markdown-it', 'markdown-it-anchor', 'markdown-it-footnote', 'markdown-it-container', 'highlight.js'],
            yaml: ['yaml'],
          },
        },
      },
    },
  }
})
