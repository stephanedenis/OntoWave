/**
 * OntoWave UX entry point — standalone script
 * Expose setupKeyboardNav, setupThemes, setupPrint, setupMarkovPrefetch, setupNotes
 * and auto-inits when window.__OW_UX_AUTO__ !== false
 */
import { setupKeyboardNav, setupThemes, setupPrint, setupMarkovPrefetch, setupNotes } from './adapters/browser/ux'

// Export pour usage programmatique
;(window as any).OntoWaveUX = { setupKeyboardNav, setupThemes, setupPrint, setupMarkovPrefetch, setupNotes }

// Auto-init discret après chargement du DOM
const init = () => {
  if ((window as any).__OW_UX_AUTO__ === false) return
  setupKeyboardNav()
  setupThemes()
  setupPrint()
  setupMarkovPrefetch()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
