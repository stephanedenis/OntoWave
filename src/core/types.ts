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

export type ExtensionConfig = {
  base?: string[]
  preload?: string[]
  lazy?: string[]
}

export type AppConfig = {
  roots: Root[]
  engine?: 'legacy' | 'v2'
  i18n?: { default: string; supported: string[] }
  ui?: { header?: boolean; sidebar?: boolean; toc?: boolean; footer?: boolean; minimal?: boolean; menu?: boolean }
  glossary?: GlossaryConfig
  extensions?: ExtensionConfig
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

// --- ContentRenderer / ExtensionRegistry API ---

export interface ContentRenderer {
  /** Unique extension identifier */
  readonly name: string
  /** File extensions handled, e.g. ['.md', '.markdown'] */
  readonly handles: string[]
  /**
   * Sub-extension names required by this renderer.
   * The registry will opportunistically preload them when this renderer activates.
   */
  readonly requires?: string[]
  /** Returns true if this renderer can handle the given URL */
  canRender(_url: string, _contentType?: string): boolean
  /** Transforms source content into HTML */
  render(_source: string, _url: string): Promise<string>
}

export type ExtensionStatus = 'loading' | 'ready' | 'error'

export interface ExtensionRegistry {
  /** Register an already-loaded extension */
  register(_renderer: ContentRenderer): void
  /**
   * Load an extension by name.  url is a hint for future dynamic loading.
   * Returns the extension, or rejects if unavailable.
   */
  load(_name: string, _url?: string): Promise<ContentRenderer>
  /** Returns the extension capable of rendering the given URL, or null */
  resolve(_url: string, _contentType?: string): ContentRenderer | null
  /** Returns the current status of an extension */
  getStatus(_name: string): ExtensionStatus | undefined
}

// --- Plugin API ---

export interface PluginContext {
  /** Configuration de l'application (disponible après démarrage) */
  readonly config: AppConfig
  /** Navigue vers un chemin de route */
  navigate(_path: string): void
}

export interface OntoWavePlugin {
  /** Nom unique du plugin */
  readonly name: string
  /** Version du plugin (optionnelle) */
  readonly version?: string

  /** Appelé une fois au démarrage de l'application */
  onStart?(_ctx: PluginContext): void | Promise<void>
  /** Appelé à l'arrêt de l'application */
  onStop?(): void | Promise<void>

  /** Transforme le source Markdown avant le rendu */
  beforeRender?(_md: string, _route: string): string | Promise<string>
  /** Appelé après que le HTML est rendu et injecté dans la page */
  afterRender?(_html: string, _route: string): void | Promise<void>

  /** Appelé à chaque changement de route */
  onRouteChange?(_route: string): void | Promise<void>
}

export interface PluginManager {
  /** Enregistre un plugin */
  register(_plugin: OntoWavePlugin): void
  /** Interface fluent : enregistre et retourne le manager */
  use(_plugin: OntoWavePlugin): PluginManager
  /** Retourne la liste des plugins enregistrés */
  getPlugins(): readonly OntoWavePlugin[]
}
