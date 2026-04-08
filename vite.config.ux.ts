import { defineConfig } from 'vite'
import path from 'path'

// Build configuration for the lightweight UX enhancements script
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/ux-entry.ts'),
      name: 'OntoWaveUX',
      fileName: () => 'ontowave-ux.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'ontowave-ux.js',
      },
    },
  },
})
