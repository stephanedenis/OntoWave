import type { AppConfig } from '../../core/types'
import { getJsonFromBundle } from './bundle'

export const browserConfig = {
  async load(): Promise<AppConfig> {
    // Priority: window.ontoWaveConfig > embedded bundle > config.json
    
    // 1. Check window.ontoWaveConfig first
    if ((window as any).ontoWaveConfig) {
      return (window as any).ontoWaveConfig
    }
    
    // 2. Try embedded bundle
    const embedded = getJsonFromBundle<AppConfig>('/config.json')
    if (embedded) return embedded
    
    // 3. Try external config.json (only if nothing else exists)
    try {
      const res = await fetch('/config.json', { cache: 'no-cache' })
      if (!res.ok) {
        // No config.json found - return empty config
        return {} as AppConfig
      }
      return await res.json()
    } catch (e) {
      // Fetch failed - return empty config
      return {} as AppConfig
    }
  }
}
