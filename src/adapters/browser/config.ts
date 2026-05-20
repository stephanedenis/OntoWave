import type { AppConfig } from '../../core/types'
import { getJsonFromBundle } from './bundle'

declare global {
  interface Window {
    ontoWaveConfig?: AppConfig
  }
}

export function primeInlineConfigBundle(): AppConfig | null {
  const inlineConfig = window.ontoWaveConfig
  if (inlineConfig && typeof inlineConfig === 'object') {
    try {
      window.__ONTOWAVE_BUNDLE__ = window.__ONTOWAVE_BUNDLE__ ?? {}
      window.__ONTOWAVE_BUNDLE__['/config.json'] = JSON.stringify(inlineConfig)
      return inlineConfig
    } catch {
      // Ignore une config injectée non sérialisable pour ne pas faire échouer l'init
    }
  }
  return getJsonFromBundle<AppConfig>('/config.json')
}

export const browserConfig = {
  async load(): Promise<AppConfig> {
    const embedded = primeInlineConfigBundle()
    if (embedded) return embedded
    // La config doit être injectée par la page hôte via window.__ONTOWAVE_BUNDLE__
    // Jamais de fetch externe sans directive explicite
    return { roots: [{ base: '/', root: '/' }] }
  }
}
