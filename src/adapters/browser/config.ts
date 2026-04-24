import type { AppConfig } from '../../core/types'
import { getJsonFromBundle } from './bundle'

declare global {
  interface Window {
    ontoWaveConfig?: AppConfig
  }
}

export const browserConfig = {
  async load(): Promise<AppConfig> {
    // Sucre syntaxique : window.ontoWaveConfig → __ONTOWAVE_BUNDLE__['/config.json']
    if (window.ontoWaveConfig) {
      window.__ONTOWAVE_BUNDLE__ = window.__ONTOWAVE_BUNDLE__ ?? {}
      window.__ONTOWAVE_BUNDLE__['/config.json'] = JSON.stringify(window.ontoWaveConfig)
    }
    const embedded = getJsonFromBundle<AppConfig>('/config.json')
    if (embedded) return embedded
    // La config doit être injectée par la page hôte via window.__ONTOWAVE_BUNDLE__
    // Jamais de fetch externe sans directive explicite
    return { roots: [{ base: '/', root: '/' }] }
  }
}
