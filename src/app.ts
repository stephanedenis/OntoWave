import type {
  AppConfig,
  ConfigService,
  ContentPathStrategy,
  ContentService,
  MarkdownRenderer,
  RouterService,
  ViewRenderer,
  PostRenderEnhancer,
} from './core/types'
import { resolveCandidates as defaultResolve } from './core/logic'

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

export function createApp(deps: {
  config: ConfigService
  content: ContentService
  resolver?: ContentPathStrategy
  router: RouterService
  view: ViewRenderer
  md: MarkdownRenderer
  enhance?: PostRenderEnhancer
}) {
  const resolver = deps.resolver ?? { resolveCandidates: defaultResolve }
  let disposer: (() => void) | null = null
  let cfg: AppConfig | null = null

  async function renderRoute(path?: string) {
    if (!cfg) return
    const route = path ?? deps.router.get().path
    const [routePath, queryStr] = route.split('?')
    const params = new URLSearchParams(queryStr || '')
    const viewMode = params.get('view') || ''
  const mdSrc = await loadMarkdown(cfg.roots, routePath, deps.content, resolver)
    const html = deps.md.render(mdSrc)
  const mode = viewMode.toLowerCase()
  // Split view: show Markdown source and its rendered HTML side-by-side
  if (mode === 'split' || mode === 'sbs') {
      const escapeHtml = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      const combined = `
        <div style="display:flex; gap:1rem; align-items:flex-start;">
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
            <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${escapeHtml(mdSrc)}</pre>
          </div>
          <div style="flex:1 1 50%; min-width:0; border:1px solid #ddd; border-radius:4px; overflow:auto; max-height:70vh;">
            <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Rendu (HTML/SVG)</div>
            <div style="padding:0.75rem;">${html}</div>
          </div>
        </div>`
      deps.view.setHtml(combined)
    } else if (mode === 'md') {
      const escapeHtml = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      const only = `
        <div style="border:1px solid #ddd; border-radius:4px; overflow:auto;">
          <div style="padding:0.5rem; font-weight:600; border-bottom:1px solid #eee; background:#fafafa;">Source (.md)</div>
          <pre style="margin:0; padding:0.75rem; white-space:pre; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.9em; line-height:1.4;">${escapeHtml(mdSrc)}</pre>
        </div>`
      deps.view.setHtml(only)
    } else {
      deps.view.setHtml(html)
    }
    const h1 = /<h1[^>]*>(.*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim()
    if (h1) deps.view.setTitle(`${h1} — OntoWave`)
  await deps.enhance?.afterRender(html, route)
  }

  async function start() {
    cfg = await deps.config.load()
    await renderRoute()
    disposer = deps.router.subscribe(() => { void renderRoute() })
  }

  function stop() {
    disposer?.()
    disposer = null
  }

  return { start, stop, renderRoute }
}
