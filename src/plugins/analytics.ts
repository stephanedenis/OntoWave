import type { Plugin, PluginContext } from '../core/plugins'

/**
 * Plugin d'exemple : Analytics
 * 
 * Démontre comment créer un plugin pour tracker les vues de pages
 * et intégrer Google Analytics ou d'autres services de tracking.
 */
class AnalyticsPlugin implements Plugin {
  name = 'analytics'
  version = '1.0.0'
  description = 'Plugin de tracking analytique pour OntoWave'
  author = 'OntoWave Team'

  async initialize(context: PluginContext) {
    context.logger.info('Initializing analytics plugin...')
    
    // Configurer le tracking
    const trackingId = context.config.analytics?.trackingId
    if (trackingId) {
      await this.setupGoogleAnalytics(trackingId, context)
    }

    // Écouter les changements de route
    context.registerHook('afterNavigation', (route: string) => {
      this.trackPageView(route, context)
    })

    context.logger.info('Analytics plugin initialized')
  }

  async destroy() {
    console.log('Analytics plugin destroyed')
  }

  hooks = {
    afterNavigation: async (route: string) => {
      // Le hook sera enregistré dynamiquement dans initialize
    }
  }

  // Méthodes privées du plugin
  private async setupGoogleAnalytics(trackingId: string, context: PluginContext) {
    // Injecter Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(script)

    // Configurer gtag
    const configScript = document.createElement('script')
    configScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}');
    `
    document.head.appendChild(configScript)

    context.logger.info(`Google Analytics configured with ID: ${trackingId}`)
  }

  private trackPageView(route: string, context: PluginContext) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: route
      })
      
      context.logger.debug(`Page view tracked: ${route}`)
    }
  }
}

export const analyticsPlugin = new AnalyticsPlugin()