import type { OntoWavePlugin, PluginManager } from './types'

/**
 * Crée un gestionnaire de plugins pour OntoWave.
 *
 * Usage :
 * ```js
 * const plugins = createPluginManager()
 * plugins.use(monPlugin)
 * ```
 */
export function createPluginManager(): PluginManager {
  const plugins: OntoWavePlugin[] = []

  function register(plugin: OntoWavePlugin): void {
    if (plugins.some((p) => p.name === plugin.name)) {
      console.warn(`[OntoWave] Plugin "${plugin.name}" est déjà enregistré`)
      return
    }
    plugins.push(plugin)
  }

  function use(plugin: OntoWavePlugin): PluginManager {
    register(plugin)
    return manager
  }

  function getPlugins(): readonly OntoWavePlugin[] {
    return [...plugins]
  }

  const manager: PluginManager = { register, use, getPlugins }
  return manager
}
