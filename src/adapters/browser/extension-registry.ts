/**
 * Registre des extensions ContentRenderer pour le navigateur.
 * Gère l'état de chaque extension (loading / ready / error)
 * et émet des événements DOM pour alimenter le badge d'avertissement du menu.
 *
 * Événements émis sur window :
 *   ow:extension:loading  { detail: { name: string } }
 *   ow:extension:ready    { detail: { name: string } }
 *   ow:extension:error    { detail: { name: string; error: unknown } }
 */
import type { ContentRenderer, ExtensionRegistry, ExtensionStatus } from '../../core/types'

function emitExtensionEvent(
  type: 'ow:extension:loading' | 'ow:extension:ready' | 'ow:extension:error',
  name: string,
  error?: unknown,
) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(type, { detail: { name, error } }))
}

export class BrowserExtensionRegistry implements ExtensionRegistry {
  private readonly renderers = new Map<string, ContentRenderer>()
  private readonly statuses = new Map<string, ExtensionStatus>()
  private readonly pending = new Map<string, Promise<ContentRenderer>>()

  register(renderer: ContentRenderer): void {
    this.renderers.set(renderer.name, renderer)
    this.statuses.set(renderer.name, 'ready')
    emitExtensionEvent('ow:extension:ready', renderer.name)
  }

  /**
   * Charge une extension par nom.
   * - Si déjà enregistrée : retourne immédiatement.
   * - Si un chargement est en cours : renvoie la même Promise.
   * - Sinon : tente un import() dynamique via url.
   *
   * Note : dans le build IIFE actuel (inlineDynamicImports: true) les imports
   * dynamiques sont inlinés — le chargement est donc synchrone en pratique.
   * L'API reste asynchrone pour la compatibilité avec le futur split de bundle.
   */
  async load(name: string, url?: string): Promise<ContentRenderer> {
    const existing = this.renderers.get(name)
    if (existing) return existing

    const inFlight = this.pending.get(name)
    if (inFlight) return inFlight

    if (!url) {
      const err = new Error(`[OntoWave] Extension inconnue : ${name}`)
      this.statuses.set(name, 'error')
      emitExtensionEvent('ow:extension:error', name, err)
      return Promise.reject(err)
    }

    this.statuses.set(name, 'loading')
    emitExtensionEvent('ow:extension:loading', name)

    const p = import(/* @vite-ignore */ url)
      .then((mod) => {
        const renderer = (mod.default ?? mod) as ContentRenderer
        this.renderers.set(name, renderer)
        this.statuses.set(name, 'ready')
        emitExtensionEvent('ow:extension:ready', name)
        return renderer
      })
      .catch((err) => {
        this.statuses.set(name, 'error')
        emitExtensionEvent('ow:extension:error', name, err)
        this.pending.delete(name)
        throw err
      })

    this.pending.set(name, p)
    return p
  }

  resolve(url: string, contentType?: string): ContentRenderer | null {
    for (const renderer of this.renderers.values()) {
      if (renderer.canRender(url, contentType)) return renderer
    }
    return null
  }

  getStatus(name: string): ExtensionStatus | undefined {
    return this.statuses.get(name)
  }
}

/** Instance partagée du registre (singleton pour le runtime navigateur). */
export const browserExtensionRegistry = new BrowserExtensionRegistry()
