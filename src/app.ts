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
  const cands = resolver.resolveCandidates(roots, path)
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
    const mdSrc = await loadMarkdown(cfg.roots, route, deps.content, resolver)
    const html = deps.md.render(mdSrc)
  deps.view.setHtml(html)
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
