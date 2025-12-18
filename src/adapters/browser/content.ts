import { getTextFromBundle } from './bundle'
import type { ExternalDataSource } from '../../core/types'

// Store external sources config
let externalSources: ExternalDataSource[] = []

export function setExternalDataSources(sources: ExternalDataSource[]) {
  externalSources = sources || []
}

export const browserContent = {
  async fetchText(url: string): Promise<string | null> {
    // Check embedded content first
    const embedded = getTextFromBundle(url)
    if (embedded != null) return embedded

    // Determine if URL is external (starts with http/https)
    const isExternal = /^https?:\/\//i.test(url)
    
    try {
      if (isExternal) {
        // Find matching external source config
        const sourceConfig = externalSources.find(s => url.startsWith(s.baseUrl))
        
        const fetchOptions: RequestInit = {
          cache: 'no-cache',
          mode: sourceConfig?.corsEnabled ? 'cors' : 'no-cors',
        }
        
        // Add custom headers if provided
        if (sourceConfig?.headers) {
          fetchOptions.headers = sourceConfig.headers
        }
        
        const res = await fetch(url, fetchOptions)
        
        if (!res.ok) {
          console.warn(`[OntoWave] Failed to fetch external content: ${url} (${res.status} ${res.statusText})`)
          return null
        }
        
        return await res.text()
      } else {
        // Local content - standard fetch
        const res = await fetch(url, { cache: 'no-cache' })
        if (!res || !res.ok) return null
        return await res.text()
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('CORS')) {
        console.error(`[OntoWave] CORS error fetching ${url}. Ensure the server has proper CORS headers or enable CORS in config.`)
      } else {
        console.error(`[OntoWave] Error fetching ${url}:`, error)
      }
      return null
    }
  }
}
