import { defineConfig } from 'vite'
import path from 'path'

// Build configuration for dist/ package distribution
export default defineConfig({
  base: './',
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
        inlineDynamicImports: true,
        entryFileNames: 'ontowave.js',
        assetFileNames: 'ontowave.[ext]'
      }
    }
  }
})
