import type { AppConfig } from '../../core/types'
import { getJsonFromBundle } from './bundle'

export const browserConfig = {
  async load(): Promise<AppConfig> {
    const embedded = getJsonFromBundle<AppConfig>('/config.json')
    if (embedded) return embedded
    // La config doit être injectée par la page hôte via window.__ONTOWAVE_BUNDLE__
    // Jamais de fetch externe sans directive explicite
    return { roots: [{ base: '/', root: '/' }] }
  }
}
