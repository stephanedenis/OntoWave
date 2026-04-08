export type Route = { path: string }

export type Root = { base: string; root: string }

export type GlossaryTerm = {
  term: string
  aliases?: string[]
  definition: string
  href: string
}

export type GlossaryMatchingConfig = {
  caseSensitive?: boolean
  wordBoundary?: boolean
  firstOccurrenceOnly?: boolean
}

export type GlossaryExcludeConfig = {
  elements?: string[]
}

export type GlossarySvgConfig = {
  inline?: boolean
}

export type GlossaryUiConfig = {
  underlineStyle?: 'dotted' | 'dashed' | 'solid'
  clickBehavior?: 'sidebar' | 'tooltip'
  tooltip?: {
    showOnHover?: boolean
    delay?: number
    maxWidth?: number
  }
}

export type GlossaryConfig = {
  enabled?: boolean
  sources?: string[]
  matching?: GlossaryMatchingConfig
  exclude?: GlossaryExcludeConfig
  svg?: GlossarySvgConfig
  ui?: GlossaryUiConfig
}

export type AppConfig = {
  roots: Root[]
  engine?: 'legacy' | 'v2'
  i18n?: { default: string; supported: string[] }
  ui?: { header?: boolean; sidebar?: boolean; toc?: boolean; footer?: boolean; minimal?: boolean; menu?: boolean }
  glossary?: GlossaryConfig
}

export interface ConfigService {
  load(): Promise<AppConfig>
}

export interface ContentService {
  fetchText(_url: string): Promise<string | null>
}

export interface ContentPathStrategy {
  resolveCandidates(_roots: Root[], _path: string): string[]
}

export interface RouterService {
  get(): Route
  subscribe(_cb: (_r: Route) => void): () => void
  navigate(_path: string): void
}

export interface ViewRenderer {
  setHtml(_html: string): void
  setTitle(_title: string): void
  setSidebar?(_html: string): void
  setToc?(_html: string): void
}

export interface PostRenderEnhancer {
  afterRender(_html: string, _route: string): Promise<void> | void
}

export interface MarkdownRenderer {
  render(_mdSrc: string): string
}
