import type { AppConfig } from '../../core/types'
import { getJsonFromBundle } from './bundle'

export const browserConfig = {
  async load(): Promise<AppConfig> {
  const embedded = getJsonFromBundle<AppConfig>('/config.json')
  if (embedded) return embedded
  const res = await fetch('/config.json', { cache: 'no-cache' })
  const cfg = await res.json()
  return cfg
  }
}
