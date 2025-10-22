/**
 * OntoWave Library Entry Point
 * 
 * Expose initOntoWave pour usage UMD :
 * - CDN standalone : auto-init au DOMContentLoaded
 * - Programmatique : window.OntoWave.init()
 */

import { createApp } from './app'
import { browserConfig } from './adapters/browser/config'
import { browserContent } from './adapters/browser/content'
import { browserRouter } from './adapters/browser/router'
import { browserView } from './adapters/browser/view'
import { createMd as createMdV2 } from './adapters/browser/md'
import { enhancePage } from './adapters/browser/enhance'
import { getJsonFromBundle } from './adapters/browser/bundle'

/**
 * Initialize OntoWave application
 * Cette fonction est exportée et accessible via window.OntoWave.init() en UMD
 */
export async function initOntoWave() {
  console.log('[OntoWave] initOntoWave() called')
  
  // Toggle engine via config.json; fallback v2 par défaut si absent
  const cfg = getJsonFromBundle('/config.json') || await fetch('/config.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null) || { engine: 'v2' }
  const engine = cfg.engine ?? 'v2'
  console.log('[OntoWave] Engine:', engine, 'Config:', cfg)
  
  // UI options
  try {
    const H = document.getElementById('site-header')
    const S = document.getElementById('sidebar')
    const T = document.getElementById('toc')
    const F = document.getElementById('floating-menu')
    const ui = cfg.ui || {}
    if (ui.minimal) {
      document.body.classList.add('minimal')
      H?.classList.add('hidden-by-config'); S?.classList.add('hidden-by-config'); T?.classList.add('hidden-by-config')
    } else {
      if (ui.header === false) H?.classList.add('hidden-by-config')
      if (ui.sidebar === false) S?.classList.add('hidden-by-config')
      if (ui.toc === false) T?.classList.add('hidden-by-config')
    }
    if (ui.menu === false) F?.classList.add('hidden-by-config')
  } catch {}
  
  // i18n: détecter la langue préférée et rediriger vers la base correspondante si on est à la racine
  try {
    if (location.hash === '' || location.hash === '#/' || location.hash === '#') {
      // Redirection forcée vers index.md
      location.hash = '#index.md'
      return; // Sortir pour laisser l'application se recharger avec le nouveau hash
    }
  } catch {}
  
  // Brand
  const brand = document.getElementById('brand')
  if (brand && typeof cfg.brand === 'string') brand.textContent = cfg.brand
  
  if (engine === 'v2') {
    console.log('[OntoWave] Creating app with engine v2')
    const app = createApp({
      config: browserConfig,
      content: browserContent,
      router: browserRouter,
      view: browserView,
      md: createMdV2({ light: false }),
      enhance: { 
        afterRender: async (html: string, _route: string) => {
          const appEl = document.getElementById('app')!
          await enhancePage(appEl, html)
        }
      }
    })
    console.log('[OntoWave] Starting app...')
    await app.start()
    console.log('[OntoWave] App started successfully')
  } else {
    console.error('OntoWave: unknown engine', engine)
  }
}

/**
 * Export default pour compatibilité
 */
export default { init: initOntoWave }

/**
 * Note: L'auto-initialisation est gérée par le footer dans vite.config.lib.ts
 * Le code s'exécute automatiquement après le chargement du bundle UMD
 */
