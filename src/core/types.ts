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

// --- Extension API (v2.0 modular architecture) ---

export interface ContentRenderer {
  /** Identifiant unique de l'extension */
  readonly name: string
  /** Extensions de fichier gérées, ex. ['.md', '.markdown'] */
  readonly handles: string[]
  /** Déclarations de sous-extensions requises */
  readonly requires?: string[]
  /** Retourne true si cette extension peut traiter l'URL donnée */
  canRender(url: string, contentType?: string): boolean
  /** Transforme le contenu source en HTML */
  render(source: string, url: string): Promise<string>
}

export type ExtensionConfig = {
  base?: string[]    // chargés avec le noyau
  preload?: string[] // chargés juste après le premier rendu
  lazy?: string[]    // chargés à la demande
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
