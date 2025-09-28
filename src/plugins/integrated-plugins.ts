/**
 * Plugins intégrés OntoWave
 * 
 * Ces plugins sont inclus dans le .min.js et s'auto-enregistrent
 * Configuration via HTML uniquement (data-plugins ou window.ontoWaveConfig)
 */

import { OntoWavePlugin, PluginContext, PluginRegistry } from '../core/plugins';

/**
 * Plugin Analytics - Suivi des pages et interactions
 * Configuration HTML:
 * data-plugins='[{"name":"analytics","enabled":true,"config":{"trackingId":"GA-XXX"}}]'
 */
class AnalyticsPlugin implements OntoWavePlugin {
  readonly name = 'analytics';
  readonly version = '1.0.0';
  readonly description = 'Suivi analytique des pages et interactions utilisateur';
  
  enabled = false;
  private trackingId?: string;
  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.trackingId = (this as any).config?.trackingId;
    
    console.log(`📊 Analytics Plugin initialized with ID: ${this.trackingId}`);
    
    // Hook : suivre les pages visitées
    context.hooks.afterPageRender((element: HTMLElement) => {
      this.trackPageView(window.location.pathname);
    });
    
    // Hook : suivre les clics sur liens
    this.setupClickTracking();
  }

  private trackPageView(page: string): void {
    if (!this.trackingId) return;
    
    console.log(`📊 Analytics: Page view tracked - ${page}`);
    
    // Intégration Google Analytics (exemple)
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: page
      });
    }
  }

  private setupClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Tracker les liens externes
      if (target.tagName === 'A' && (target as HTMLAnchorElement).href) {
        const href = (target as HTMLAnchorElement).href;
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
          this.trackEvent('external_link', { url: href });
        }
      }
      
      // Tracker les interactions avec les diagrammes
      if (target.closest('.mermaid, .plantuml-diagram')) {
        this.trackEvent('diagram_interaction', { 
          type: target.closest('.mermaid') ? 'mermaid' : 'plantuml' 
        });
      }
    });
  }

  private trackEvent(eventName: string, parameters: Record<string, any>): void {
    if (!this.trackingId) return;
    
    console.log(`📊 Analytics: Event tracked - ${eventName}`, parameters);
    
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  }

  async destroy(): Promise<void> {
    console.log('📊 Analytics Plugin destroyed');
  }
}

/**
 * Plugin Dark Mode - Thème sombre automatique
 * Configuration HTML:
 * data-plugins='[{"name":"darkmode","enabled":true,"config":{"auto":true}}]'
 */
class DarkModePlugin implements OntoWavePlugin {
  readonly name = 'darkmode';
  readonly version = '1.0.0';
  readonly description = 'Basculement automatique entre thèmes clair et sombre';
  
  enabled = false;
  private auto = true;
  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.auto = (this as any).config?.auto !== false;
    
    console.log('🌙 Dark Mode Plugin initialized');
    
    // Ajouter les styles CSS pour le thème sombre
    this.injectDarkModeStyles();
    
    // Créer le bouton de basculement
    this.createToggleButton();
    
    // Mode automatique basé sur les préférences système
    if (this.auto) {
      this.setupAutoMode();
    }
    
    // Charger les préférences sauvegardées
    this.loadUserPreference();
  }

  private injectDarkModeStyles(): void {
    const styles = `
      /* Dark Mode Styles pour OntoWave */
      [data-theme="dark"] {
        --bg-color: #1a1a1a;
        --text-color: #e1e1e1;
        --link-color: #58a6ff;
        --border-color: #30363d;
        --code-bg: #161b22;
        --header-bg: #21262d;
      }
      
      [data-theme="dark"] body {
        background-color: var(--bg-color);
        color: var(--text-color);
      }
      
      [data-theme="dark"] .ontowave-container {
        color: var(--text-color);
      }
      
      [data-theme="dark"] pre, 
      [data-theme="dark"] code {
        background-color: var(--code-bg);
        color: var(--text-color);
      }
      
      [data-theme="dark"] a {
        color: var(--link-color);
      }
      
      [data-theme="dark"] .ontowave-menu {
        background-color: var(--header-bg);
        border-color: var(--border-color);
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  private createToggleButton(): void {
    const button = document.createElement('button');
    button.innerHTML = '🌙';
    button.className = 'ontowave-darkmode-toggle';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: rgba(0,0,0,0.1);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 18px;
    `;
    
    button.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    document.body.appendChild(button);
  }

  private setupAutoMode(): void {
    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.auto) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Appliquer le thème initial
    if (mediaQuery.matches) {
      this.setTheme('dark');
    }
  }

  private loadUserPreference(): void {
    const savedTheme = localStorage.getItem('ontowave-theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      this.setTheme(savedTheme);
    }
  }

  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private setTheme(theme: 'dark' | 'light'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ontowave-theme', theme);
    
    // Mettre à jour l'icône du bouton
    const button = document.querySelector('.ontowave-darkmode-toggle');
    if (button) {
      button.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
    
    console.log(`🌙 Theme switched to: ${theme}`);
  }

  async destroy(): Promise<void> {
    const button = document.querySelector('.ontowave-darkmode-toggle');
    if (button) {
      button.remove();
    }
    console.log('🌙 Dark Mode Plugin destroyed');
  }
}

/**
 * Plugin Reading Time - Estimation du temps de lecture
 * Configuration HTML:
 * data-plugins='[{"name":"readingtime","enabled":true}]'
 */
class ReadingTimePlugin implements OntoWavePlugin {
  readonly name = 'readingtime';
  readonly version = '1.0.0';
  readonly description = 'Affiche le temps de lecture estimé pour chaque page';
  
  enabled = false;
  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    console.log('📖 Reading Time Plugin initialized');
    
    // Hook : calculer le temps de lecture après rendu
    context.hooks.afterPageRender((element: HTMLElement) => {
      this.addReadingTime(element);
    });
  }

  private addReadingTime(element: HTMLElement): void {
    // Compter les mots dans le contenu
    const textContent = element.textContent || '';
    const wordCount = this.countWords(textContent);
    const readingTime = this.calculateReadingTime(wordCount);
    
    // Créer l'élément de temps de lecture
    const readingTimeElement = this.createReadingTimeElement(readingTime, wordCount);
    
    // L'insérer au début du contenu
    const firstChild = element.firstElementChild;
    if (firstChild) {
      element.insertBefore(readingTimeElement, firstChild);
    } else {
      element.appendChild(readingTimeElement);
    }
  }

  private countWords(text: string): number {
    // Supprimer les espaces multiples et compter les mots
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 0).length;
  }

  private calculateReadingTime(wordCount: number): string {
    // Vitesse de lecture moyenne : 200 mots par minute
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    if (minutes === 1) {
      return '1 minute';
    } else {
      return `${minutes} minutes`;
    }
  }

  private createReadingTimeElement(readingTime: string, wordCount: number): HTMLElement {
    const element = document.createElement('div');
    element.className = 'ontowave-reading-time';
    element.style.cssText = `
      font-size: 0.9em;
      color: #666;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #007acc;
    `;
    
    const currentLang = this.context?.utils.getCurrentLanguage() || 'en';
    const label = currentLang === 'fr' ? 'Temps de lecture' : 'Reading time';
    const wordsLabel = currentLang === 'fr' ? 'mots' : 'words';
    
    element.innerHTML = `
      <span>📖 ${label}: <strong>${readingTime}</strong></span>
      <span style="margin-left: 1rem; font-size: 0.8em;">${wordCount} ${wordsLabel}</span>
    `;
    
    return element;
  }

  async destroy(): Promise<void> {
    // Supprimer tous les éléments de temps de lecture
    document.querySelectorAll('.ontowave-reading-time').forEach(el => el.remove());
    console.log('📖 Reading Time Plugin destroyed');
  }
}

// Auto-enregistrement des plugins intégrés
// Ces plugins sont disponibles immédiatement dans le .min.js
PluginRegistry.register(new AnalyticsPlugin());
PluginRegistry.register(new DarkModePlugin());
PluginRegistry.register(new ReadingTimePlugin());

export { AnalyticsPlugin, DarkModePlugin, ReadingTimePlugin };