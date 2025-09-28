import type {
  Plugin,
  PluginContext,
  PluginManager,
  PluginServices,
  PluginLogger,
  PluginHooks,
  PluginEvents,
} from './plugins'

/**
 * Implémentation du gestionnaire de plugins OntoWave
 */
export class OntoWavePluginManager implements PluginManager {
  private plugins = new Map<string, Plugin>()
  private contexts = new Map<string, PluginContext>()
  private services: PluginServices
  private globalConfig: any

  constructor(services: PluginServices, config: any) {
    this.services = services
    this.globalConfig = config
  }

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`)
    }

    // Vérifier les dépendances
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin '${plugin.name}' requires dependency '${dep}' which is not loaded`)
        }
      }
    }

    // Créer le contexte du plugin
    const context = this.createPluginContext(plugin)
    
    try {
      // Initialiser le plugin
      if (plugin.initialize) {
        await plugin.initialize(context)
      }

      // Enregistrer le plugin
      this.plugins.set(plugin.name, plugin)
      this.contexts.set(plugin.name, context)

      this.log('info', `Plugin '${plugin.name}' v${plugin.version} registered successfully`)
    } catch (error) {
      this.log('error', `Failed to register plugin '${plugin.name}':`, error)
      throw error
    }
  }

  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin '${name}' is not registered`)
    }

    try {
      // Appeler le hook de destruction
      if (plugin.destroy) {
        await plugin.destroy()
      }

      // Supprimer le plugin
      this.plugins.delete(name)
      this.contexts.delete(name)

      this.log('info', `Plugin '${name}' unregistered successfully`)
    } catch (error) {
      this.log('error', `Failed to unregister plugin '${name}':`, error)
      throw error
    }
  }

  list(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  isActive(name: string): boolean {
    return this.plugins.has(name)
  }

  async executeHooks<T extends keyof PluginHooks>(
    event: T, 
    ...args: any[]
  ): Promise<any> {
    const results: any[] = []

    for (const [name, plugin] of this.plugins) {
      const hook = plugin.hooks?.[event] as Function
      if (hook) {
        try {
          const result = await hook(...args)
          results.push(result)
        } catch (error) {
          this.log('error', `Plugin '${name}' hook '${event}' failed:`, error)
          this.emit('error', { 
            message: `Plugin '${name}' hook '${event}' failed`, 
            error: error as Error 
          })
        }
      }
    }

    // Pour certains hooks, nous retournons le résultat transformé
    if (event === 'beforeMarkdownRender' || event === 'afterHtmlRender' || event === 'transformContent') {
      return results.reduce((acc, result) => result || acc, args[0])
    }

    return results
  }

  emit<T extends keyof PluginEvents>(event: T, data: PluginEvents[T]): void {
    for (const [name, context] of this.contexts) {
      try {
        context.emit(event, data)
      } catch (error) {
        this.log('error', `Plugin '${name}' event '${event}' handler failed:`, error)
      }
    }
  }

  private createPluginContext(plugin: Plugin): PluginContext {
    const logger = this.createLogger(plugin.name)
    const hooks = new Map<keyof PluginHooks, Function[]>()

    return {
      config: this.globalConfig,
      services: this.services,
      logger,
      
      registerHook: <T extends keyof PluginHooks>(event: T, handler: PluginHooks[T]) => {
        if (!hooks.has(event)) {
          hooks.set(event, [])
        }
        hooks.get(event)!.push(handler as Function)
      },
      
      emit: <T extends keyof PluginEvents>(event: T, data: PluginEvents[T]) => {
        // Émettre l'événement vers d'autres plugins
        this.emit(event, data)
      }
    }
  }

  private createLogger(pluginName: string): PluginLogger {
    const prefix = `[Plugin:${pluginName}]`
    
    return {
      info: (message: string, ...args: any[]) => {
        console.info(prefix, message, ...args)
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(prefix, message, ...args)
      },
      error: (message: string, ...args: any[]) => {
        console.error(prefix, message, ...args)
      },
      debug: (message: string, ...args: any[]) => {
        console.debug(prefix, message, ...args)
      }
    }
  }

  private log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    const logger = console[level] || console.log
    logger('[PluginManager]', message, ...args)
  }
}