/**
 * OntoWave Plugin Registry
 * 
 * Index des plugins disponibles pour OntoWave
 */

export { analyticsPlugin } from './analytics'
export { syntaxHighlighterPlugin } from './syntax-highlighter'

// Export des types pour les développeurs de plugins
export type * from '../core/plugins'
export { OntoWavePluginManager } from '../core/plugin-manager'

/**
 * Plugin registry - liste des plugins officiels
 */
export const OFFICIAL_PLUGINS = [
  'analytics',
  'custom-syntax-highlighter'
] as const

/**
 * Helper pour créer un plugin simple
 */
export function createSimplePlugin(config: {
  name: string
  version: string
  description?: string
  author?: string
  beforeMarkdownRender?: (markdown: string) => string
  afterHtmlRender?: (html: string) => string
  afterNavigation?: (route: string) => void
}) {
  return {
    name: config.name,
    version: config.version,
    description: config.description,
    author: config.author,
    hooks: {
      beforeMarkdownRender: config.beforeMarkdownRender,
      afterHtmlRender: config.afterHtmlRender,
      afterNavigation: config.afterNavigation,
    }
  }
}