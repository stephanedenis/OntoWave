import type {
  Route,
  Root,
  AppConfig,
  ConfigService,
  ContentService,
  ContentPathStrategy,
  RouterService,
  ViewRenderer,
  PostRenderEnhancer,
  MarkdownRenderer,
} from './types'

/**
 * OntoWave Plugin System - Core Architecture
 * 
 * Système modulaire de plugins pour étendre OntoWave
 * Philosophy: Un seul fichier .min.js, configuration dans HTML uniquement
 * Configuration : HTML data-attributes ou window.ontoWaveConfig.plugins
 * Chargement : Dynamique à l'exécution, pas de fichiers externes
 */

/**
 * Configuration des plugins via HTML (respecte la philosophie OntoWave)
 * Exemple HTML:
 * <div id="ontowave-container" data-plugins='[{"name":"analytics","enabled":true}]'>
 * ou
 * <script>window.ontoWaveConfig = {plugins: [{name:"analytics",enabled:true}]}</script>
 */
export interface HTMLPluginConfig {
  /** Nom du plugin */
  name: string;
  /** Plugin activé */
  enabled?: boolean;
  /** Configuration spécifique au plugin */
  config?: Record<string, any>;
  /** URL externe du plugin (optionnel, pour plugins tiers) */
  source?: string;
}

/**
 * Interface Plugin OntoWave (intégrée dans le .min.js)
 * Chaque plugin est une classe ou fonction auto-enregistrée
 */
export interface OntoWavePlugin {
  /** Nom unique du plugin */
  readonly name: string;
  /** Version du plugin */
  readonly version: string;
  /** Description du plugin */
  readonly description?: string;
  
  /** Initialisation du plugin */
  initialize(context: PluginContext): Promise<void> | void;
  
  /** Nettoyage du plugin */
  destroy(): Promise<void> | void;
  
  /** Le plugin est-il activé */
  enabled: boolean;
}

/**
 * Contexte fourni aux plugins par OntoWave
 */
export interface PluginContext {
  /** Configuration OntoWave */
  config: any;
  /** Container principal */
  container: HTMLElement;
  /** Méthodes utilitaires OntoWave */
  utils: {
    loadMarkdown: (path: string) => Promise<string>;
    renderMarkdown: (content: string) => Promise<string>;
    t: (key: string, locale?: string) => string; // i18n
    getCurrentLanguage: () => string;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
  };
  /** Hooks système OntoWave */
  hooks: PluginHooks;
}

/**
 * Hooks disponibles pour les plugins
 */
export interface PluginHooks {
  /** Avant le rendu d'une page */
  beforePageRender: (callback: (content: string) => string | Promise<string>) => void;
  /** Après le rendu d'une page */
  afterPageRender: (callback: (element: HTMLElement) => void | Promise<void>) => void;
  /** Avant l'initialisation OntoWave */
  beforeInit: (callback: (config: any) => void | Promise<void>) => void;
  /** Après l'initialisation OntoWave */
  afterInit: (callback: () => void | Promise<void>) => void;
}

/**
 * Registre global des plugins intégrés dans OntoWave
 * Les plugins s'auto-enregistrent au chargement du .min.js
 */
export class PluginRegistry {
  private static plugins = new Map<string, OntoWavePlugin>();

  /**
   * Enregistre un plugin dans le registre
   */
  static register(plugin: OntoWavePlugin): void {
    this.plugins.set(plugin.name, plugin);
    console.log(`🔌 Plugin registered: ${plugin.name} v${plugin.version}`);
  }

  /**
   * Récupère un plugin par nom
   */
  static getPlugin(name: string): OntoWavePlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Récupère tous les plugins disponibles
   */
  static getAllPlugins(): Map<string, OntoWavePlugin> {
    return new Map(this.plugins);
  }

  /**
   * Liste les noms des plugins disponibles
   */
  static getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }
}

/**
 * PluginManager - Gestionnaire de plugins OntoWave
 * 
 * Philosophie OntoWave:
 * 1. Configuration via HTML (data-plugins ou window.ontoWaveConfig)
 * 2. Plugins intégrés dans le .min.js (pas de fichiers externes)
 * 3. Chargement dynamique à l'exécution
 * 4. Auto-enregistrement des plugins via PluginRegistry
 */
export class PluginManager {
  private plugins = new Map<string, OntoWavePlugin>();
  private hooks: PluginHooks;
  private context: PluginContext;
  
  constructor(context: PluginContext) {
    this.context = context;
    this.hooks = this.createHooksSystem();
  }

  /**
   * Initialise les plugins depuis la configuration HTML
   * Respecte la philosophie OntoWave : pas de fichiers externes
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔌 Initializing OntoWave Plugin System...');
      
      // 1. Charger la configuration depuis HTML
      const pluginConfigs = this.loadPluginConfigFromHTML();
      
      // 2. Découvrir les plugins intégrés (auto-enregistrés)
      const availablePlugins = this.discoverIntegratedPlugins();
      
      // 3. Activer les plugins configurés
      for (const config of pluginConfigs) {
        if (config.enabled && availablePlugins.has(config.name)) {
          const plugin = availablePlugins.get(config.name)!;
          await this.activatePlugin(plugin, config);
        }
      }
      
      console.log(`🔌 Plugins initialized: ${this.plugins.size} active`);
      
    } catch (error) {
      console.error('❌ Plugin system initialization failed:', error);
    }
  }

  /**
   * Charge la configuration des plugins depuis le HTML
   * Sources : data-plugins, window.ontoWaveConfig.plugins, script#ontowave-config
   */
  private loadPluginConfigFromHTML(): HTMLPluginConfig[] {
    let configs: HTMLPluginConfig[] = [];
    
    // Source 1: data-plugins sur le container
    const container = document.getElementById('ontowave-container');
    if (container?.dataset.plugins) {
      try {
        configs = JSON.parse(container.dataset.plugins);
        console.log('📄 Plugin config loaded from data-plugins:', configs);
      } catch (error) {
        console.warn('⚠️ Invalid JSON in data-plugins:', error);
      }
    }
    
    // Source 2: window.ontoWaveConfig.plugins
    if ((window as any).ontoWaveConfig?.plugins) {
      configs = (window as any).ontoWaveConfig.plugins;
      console.log('📄 Plugin config loaded from window.ontoWaveConfig:', configs);
    }
    
    // Source 3: script#ontowave-config (fallback)
    const configScript = document.getElementById('ontowave-config');
    if (configScript && configScript.textContent) {
      try {
        const fullConfig = JSON.parse(configScript.textContent);
        if (fullConfig.plugins) {
          configs = fullConfig.plugins;
          console.log('📄 Plugin config loaded from script tag:', configs);
        }
      } catch (error) {
        console.warn('⚠️ Invalid JSON in ontowave-config script:', error);
      }
    }
    
    return configs;
  }

  /**
   * Découvre les plugins intégrés dans OntoWave
   * Les plugins s'auto-enregistrent via PluginRegistry.register()
   */
  private discoverIntegratedPlugins(): Map<string, OntoWavePlugin> {
    // Les plugins intégrés sont enregistrés dans PluginRegistry
    return PluginRegistry.getAllPlugins();
  }

  /**
   * Active un plugin avec sa configuration
   */
  private async activatePlugin(plugin: OntoWavePlugin, config: HTMLPluginConfig): Promise<void> {
    try {
      // Appliquer la configuration au plugin
      if (config.config) {
        Object.assign(plugin, { config: config.config });
      }
      
      // Initialiser le plugin avec le contexte OntoWave
      plugin.enabled = true;
      await plugin.initialize(this.context);
      
      // Enregistrer le plugin actif
      this.plugins.set(plugin.name, plugin);
      
      console.log(`🔌 Plugin activated: ${plugin.name} v${plugin.version}`);
      
    } catch (error) {
      console.error(`❌ Failed to activate plugin ${plugin.name}:`, error);
    }
  }

  /**
   * Crée le système de hooks pour les plugins
   */
  private createHooksSystem(): PluginHooks {
    const hookCallbacks = {
      beforePageRender: [] as Array<(content: string) => string | Promise<string>>,
      afterPageRender: [] as Array<(element: HTMLElement) => void | Promise<void>>,
      beforeInit: [] as Array<(config: any) => void | Promise<void>>,
      afterInit: [] as Array<() => void | Promise<void>>
    };

    return {
      beforePageRender: (callback) => hookCallbacks.beforePageRender.push(callback),
      afterPageRender: (callback) => hookCallbacks.afterPageRender.push(callback),
      beforeInit: (callback) => hookCallbacks.beforeInit.push(callback),
      afterInit: (callback) => hookCallbacks.afterInit.push(callback)
    };
  }

  /**
   * Exécute les hooks before page render
   */
  async executeBeforePageRender(content: string): Promise<string> {
    let processedContent = content;
    
    for (const callback of this.getHookCallbacks('beforePageRender')) {
      try {
        const result = await callback(processedContent);
        if (typeof result === 'string') {
          processedContent = result;
        }
      } catch (error) {
        console.error('❌ Hook beforePageRender failed:', error);
      }
    }
    
    return processedContent;
  }

  /**
   * Exécute les hooks after page render
   */
  async executeAfterPageRender(element: HTMLElement): Promise<void> {
    for (const callback of this.getHookCallbacks('afterPageRender')) {
      try {
        await callback(element);
      } catch (error) {
        console.error('❌ Hook afterPageRender failed:', error);
      }
    }
  }

  /**
   * Récupère les callbacks d'un hook
   */
  private getHookCallbacks(hookName: keyof PluginHooks): any[] {
    // Accès aux callbacks via une propriété dynamique
    const callbacksProperty = hookName + 'Callbacks';
    return (this.hooks as any)[callbacksProperty] || [];
  }

  /**
   * Liste les plugins actifs
   */
  getActivePlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Désactive tous les plugins
   */
  async destroy(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.enabled = false;
        await plugin.destroy();
      } catch (error) {
        console.error(`❌ Failed to destroy plugin ${plugin.name}:`, error);
      }
    }
    this.plugins.clear();
  }
}