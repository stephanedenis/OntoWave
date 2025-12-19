/**
 * Point d'entrée OntoWave avec support des plugins
 * Génère: ontowave-with-plugins.min.js
 */

import { createApp } from './app-with-plugins'
import { browserConfig } from './adapters/browser/config'
import { browserContent } from './adapters/browser/content'
import { browserRouter } from './adapters/browser/router'
import { browserView } from './adapters/browser/view'
import { createMd } from './adapters/browser/md'

// Export des types et classes pour usage externe
export * from './core/types'
export * from './core/plugins'
export { OntoWavePluginManager } from './core/plugin-manager'
export { analyticsPlugin, syntaxHighlighterPlugin } from './plugins'

// Fonction d'initialisation automatique
function initOntoWave() {
  const app = createApp({
    config: browserConfig,
    content: browserContent,
    router: browserRouter,
    view: browserView,
    md: createMd(),
  })

  // Démarrer l'application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      app.start().catch(console.error)
    })
  } else {
    app.start().catch(console.error)
  }

  // Exposer globalement pour accès externe
  ;(window as any).OntoWave = {
    app,
    version: '1.1.0-alpha',
    pluginsEnabled: true,
  }
}

// Auto-init si chargé via script tag
if (typeof window !== 'undefined') {
  initOntoWave()
}

// Export pour usage programmatique
export { createApp }
export default createApp
