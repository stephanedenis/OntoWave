import type { AppConfig } from '../../core/types'

export const browserConfig = {
  async load(): Promise<AppConfig> {
    const res = await fetch('/config.json', { cache: 'no-cache' })
    const cfg = await res.json()
    return cfg
  }
}
