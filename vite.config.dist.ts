import { defineConfig } from 'vite'
import path from 'path'
import pkg from './package.json'

// Build configuration for dist/ package distribution
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
        inlineDynamicImports: true,
        entryFileNames: 'ontowave.js',
        assetFileNames: 'ontowave.[ext]'
      }
    }
  }
})
