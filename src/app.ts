import type {
  AppConfig,
  ConfigService,
  ContentPathStrategy,
  ContentService,
  ExtensionRegistry,
  MarkdownRenderer,
  OntoWavePlugin,
  PluginContext,
  RouterService,
  ViewRenderer,
  PostRenderEnhancer,
} from './core/types'
import { minimalRender } from './core/minimal-md'
import { resolveCandidates as defaultResolve, resolvePumlCandidates, splitHashRoute } from './core/logic'

function scrollToHashAnchor(route: string): void {
  if (typeof document === 'undefined') return
  const { anchor } = splitHashRoute('#' + route.replace(/^#/, ''))
  if (!anchor) return
  const decoded = decodeURIComponent(anchor)
  requestAnimationFrame(() => {
    const target = document.getElementById(decoded)
      || document.querySelector(`[id="${CSS.escape(decoded)}"]`)
    if (target instanceof HTMLElement) target.scrollIntoView({ block: 'start' })
  })
}

async function loadMarkdown(roots: AppConfig['roots'], path: string, content: ContentService, resolver: ContentPathStrategy): Promise<string> {
  // Ignore any query string / directives when resolving content path
  const cleanPath = path.split('?')[0]
  const cands = resolver.resolveCandidates(roots, cleanPath)
  for (const url of cands) {
    try {
      const txt = await content.fetchText(url)
      if (txt != null) return txt
    } catch {}
  }
  return `# 404 — Not found\n\nAucun document pour \`${path}\``
}

async function loadPuml(roots: AppConfig['roots'], path: string, content: ContentService): Promise<string | null> {
  const cleanPath = path.split('?')[0]
  const cands = resolvePumlCandidates(roots, cleanPath)
  for (const url of cands) {
    try {
      const txt = await content.fetchText(url)
      if (txt != null) return txt
    } catch {}
  }
  return null
}

export function createApp(deps: {
  config: ConfigService
  content: ContentService
  resolver?: ContentPathStrategy
  router: RouterService
  view: ViewRenderer
  md: MarkdownRenderer
  enhance?: PostRenderEnhancer
  plugins?: OntoWavePlugin[]
  /** Registre des extensions — active le rendu en deux temps si fourni */
  registry?: ExtensionRegistry
}) {
  const resolver = deps.resolver ?? { resolveCandidates: defaultResolve }
  const plugins = deps.plugins ?? []
  let disposer: (() => void) | null = null
  let cfg: AppConfig | null = null

  /** Applique le mode d'affichage (html / md / split) et met à jour la vue. */
  function applyViewMode(html: string, mdSrc: string, viewMode: string): void {
    const mode = viewMode.toLowerCase()
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

    if (mode === 'split' || mode === 'sbs') {
      deps.view.setHtml(`
        <div style="display:flex; gap:1rem; align-items:flex-start;">
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
            <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${esc(mdSrc)}</pre>
          </div>
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Rendu (HTML/SVG)</div>
            <div style="padding:0.75rem;">${html}</div>
          </div>
        </div>`)
    } else if (mode === 'md') {
      deps.view.setHtml(`
        <div style="border:1px solid #ddd; border-radius:4px; overflow:auto;">
          <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
          <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${esc(mdSrc)}</pre>
        </div>`)
    } else {
      deps.view.setHtml(html)
    }
  }

  async function renderRoute(path?: string) {
    if (!cfg) return
    const route = path ?? deps.router.get().path
    const { path: routedPath } = splitHashRoute('#' + route.replace(/^#/, ''))
    const [routePath, queryStr] = routedPath.split('?')
    const params = new URLSearchParams(queryStr || '')
    const viewMode = params.get('view') || ''

    // Handle .puml routes: fetch the file and render as a PlantUML diagram
    if (routePath.endsWith('.puml')) {
      const pumlSrc = await loadPuml(cfg.roots, routePath, deps.content)
      const fileName = routePath.split('/').pop() || 'diagram.puml'
      const title = fileName.replace(/\.puml$/i, '')
      if (pumlSrc != null) {
        const mdSrc = `\`\`\`plantuml\n${pumlSrc}\n\`\`\``
        const html = deps.md.render(mdSrc)
        deps.view.setHtml(html)
        deps.view.setTitle(`${title} — OntoWave`)
        await deps.enhance?.afterRender(html, route)
      } else {
        deps.view.setHtml(`<p>Fichier introuvable : <code>${routePath}</code></p>`)
        deps.view.setTitle(`${fileName} — OntoWave`)
      }
      return
    }

    let mdSrc = await loadMarkdown(cfg.roots, routePath, deps.content, resolver)

    // Plugin beforeRender hooks
    for (const plugin of plugins) {
      mdSrc = (await plugin.beforeRender?.(mdSrc, route)) ?? mdSrc
    }

    const registry = deps.registry
    let html: string

    if (registry) {
      // --- Rendu en deux temps ---
      const fullRenderer = registry.resolve(routePath)

      if (fullRenderer) {
        // Phase unique : l'extension est déjà chargée
        html = await fullRenderer.render(mdSrc, routePath)
        applyViewMode(html, mdSrc, viewMode)
      } else {
        // Phase 1 : rendu minimal immédiat (noyau, sans dépendances lourdes)
        html = minimalRender(mdSrc)
        applyViewMode(html, mdSrc, viewMode)
        const h1Phase1 = /<h1[^>]*>(.*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim()
        if (h1Phase1) deps.view.setTitle(`${h1Phase1} — OntoWave`)

        // Phase 2 : charger l'extension Markdown et re-rendre
        // Aucun reset de scroll/navigation — on met à jour uniquement le contenu
        try {
          const mdExt = await registry.load('markdown')
          html = await mdExt.render(mdSrc, routePath)
          applyViewMode(html, mdSrc, viewMode)
        } catch {
          // Extension en échec : garder le rendu minimal (le badge warning reste visible)
        }
      }
    } else {
      // Comportement existant : rendu synchrone via deps.md
      html = deps.md.render(mdSrc)
      applyViewMode(html, mdSrc, viewMode)
    }

    const h1 = /<h1[^>]*>(.*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim()
    if (h1) deps.view.setTitle(`${h1} — OntoWave`)
    await deps.enhance?.afterRender(html, route)
    scrollToHashAnchor(route)

    // Plugin afterRender hooks
    for (const plugin of plugins) {
      await plugin.afterRender?.(html, route)
    }
  }

  async function start() {
    cfg = await deps.config.load()

    // Plugin onStart hooks
    const ctx: PluginContext = {
      get config() { return cfg! },
      navigate: (path: string) => deps.router.navigate(path),
    }
    for (const plugin of plugins) {
      await plugin.onStart?.(ctx)
    }

    await renderRoute()
    disposer = deps.router.subscribe(async (r) => {
      // Plugin onRouteChange hooks
      for (const plugin of plugins) {
        await plugin.onRouteChange?.(r.path)
      }
      void renderRoute()
    })
  }

  async function stop() {
    disposer?.()
    disposer = null

    // Plugin onStop hooks
    for (const plugin of plugins) {
      await plugin.onStop?.()
    }
  }

  return { start, stop, renderRoute }
}
