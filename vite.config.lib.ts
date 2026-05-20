import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'OntoWave',
      fileName: 'ontowave',
      formats: ['umd']
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        exports: 'auto',
        footer: `
// Auto-initialize OntoWave when loaded as standalone script
(function() {
  if (typeof window !== 'undefined' && typeof window.OntoWave !== 'undefined') {
    console.log('OntoWave footer: Starting auto-init');
    var init = window.OntoWave.initOntoWave || (window.OntoWave.default && window.OntoWave.default.init);
    if (!init) {
      console.error('OntoWave: initOntoWave function not found');
      return;
    }
    
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        console.log('OntoWave: Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', function() {
          console.log('OntoWave: DOMContentLoaded triggered, calling init');
          init().catch(function(err) {
            console.error('OntoWave initialization failed:', err);
          });
        });
      } else {
        // DOM already loaded
        console.log('OntoWave: DOM already loaded, calling init immediately');
        init().catch(function(err) {
          console.error('OntoWave initialization failed:', err);
        });
      }
    }
  } else {
    console.warn('OntoWave footer: window.OntoWave not found');
  }
})();
        `
      }
    }
  }
})
