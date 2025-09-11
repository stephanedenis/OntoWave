/**
 * OntoWave - Documentation Interactive Package
 * Version: 1.0.0
 * URL: https://github.com/stephanedenis/OntoWave
 * 
 * Usage simple:
 * <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
 * <script type="application/json" id="ontowave-config">
 * {
 *   "title": "Ma Documentation",
 *   "baseUrl": "/",
 *   "defaultPage": "index.md",
 *   "mermaid": { "theme": "default" },
 *   "plantuml": { "server": "https://www.plantuml.com/plantuml" }
 * }
 * </script>
 */

(function(window) {
  'use strict';

  // Configuration par défaut
  const DEFAULT_CONFIG = {
    title: "OntoWave Documentation",
    baseUrl: "/",
    defaultPage: "index.md",
    containerId: "ontowave-container",
    mermaid: {
      theme: "default",
      startOnLoad: true,
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
      journey: { useMaxWidth: true }
    },
    plantuml: {
      server: "https://www.plantuml.com/plantuml",
      format: "svg"
    },
    prism: {
      theme: "default",
      autoload: true
    },
    navigation: {
      showHome: true,
      showBreadcrumb: true,
      showToc: true
    },
    ui: {
      theme: "default",
      responsive: true,
      animations: true
    }
  };

  // Styles CSS intégrés
  const CSS_STYLES = `
    .ontowave-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background: #fff;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    
    /* Menu flottant minimal déplaçable */
    .ontowave-floating-menu {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #e1e4e8;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(27,31,35,0.15);
      cursor: move;
      transition: all 0.3s ease;
      font-size: 1.2em;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0;
      width: 44px;
      height: 44px;
      overflow: visible;
      white-space: nowrap;
    }
    
    .ontowave-floating-menu.expanded {
      width: auto;
      height: auto;
      min-height: 44px;
      border-radius: 22px;
      padding: 10px 18px;
      gap: 10px;
    }
    
    .ontowave-floating-menu:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(27,31,35,0.25);
    }
    
    .ontowave-menu-icon {
      cursor: pointer;
      transition: transform 0.3s ease;
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4em;
      text-align: center;
      line-height: 1;
      margin: 0 auto;
    }
    
    .ontowave-menu-icon:hover {
      transform: scale(1.2);
    }
    
    .ontowave-menu-content {
      display: flex;
      align-items: center;
      gap: 15px;
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    
    .ontowave-floating-menu.expanded .ontowave-menu-content {
      opacity: 1;
      width: auto;
      overflow: visible;
    }
    
    .ontowave-menu-brand {
      font-weight: 600;
      color: #0969da;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.9em;
    }
    
    .ontowave-menu-brand:hover {
      color: #0550ae;
    }
    
    .ontowave-menu-options {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    
    .ontowave-menu-option {
      padding: 6px 10px;
      background: #f8f9fa;
      border: 1px solid #d0d7de;
      border-radius: 15px;
      font-size: 0.75em;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    
    .ontowave-menu-option:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }
    
    /* Pas d'en-tête - supprimé */
    .ontowave-header {
      display: none;
    }
    
    .ontowave-nav {
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .ontowave-nav h3 {
      margin: 0 0 1rem 0;
      color: #24292e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ontowave-nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .ontowave-nav-item {
      padding: 1rem;
      background: white;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      text-decoration: none;
      color: #24292e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      font-weight: 500;
      cursor: pointer;
    }
    
    .ontowave-nav-item:hover {
      background: #f3f4f6;
      border-color: #0969da;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(27,31,35,0.15);
    }
    
    .ontowave-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(27,31,35,0.15);
      border: 1px solid #e1e4e8;
      margin-bottom: 2rem;
      min-height: 300px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Headers corrigés */
    .ontowave-content h1 {
      color: #24292e;
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 2em;
      font-weight: 600;
    }
    
    .ontowave-content h2 {
      color: #24292e;
      margin-top: 24px;
      margin-bottom: 16px;
      font-size: 1.5em;
      font-weight: 600;
    }
    
    .ontowave-content h3 {
      color: #24292e;
      margin-top: 20px;
      margin-bottom: 12px;
      font-size: 1.25em;
      font-weight: 600;
    }
    
    /* Séparateurs hr */
    .ontowave-content hr {
      border: none;
      border-top: 1px solid #e1e4e8;
      margin: 24px 0;
    }
    
    /* Mermaid diagrams */
    .ontowave-mermaid {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      text-align: center;
    }
    
    .ontowave-loading {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
    
    .ontowave-error {
      color: #d73a49;
      text-align: center;
      padding: 2rem;
      background: #ffeef0;
      border: 1px solid #fdaeb7;
      border-radius: 6px;
    }
    
    .ontowave-mermaid {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .ontowave-plantuml {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .ontowave-plantuml img {
      max-width: 100%;
      height: auto;
    }
    
    .ontowave-code {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    
    .ontowave-breadcrumb {
      padding: 0.5rem 0;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e1e4e8;
    }
    
    .ontowave-breadcrumb a {
      color: #0969da;
      text-decoration: none;
      margin-right: 0.5rem;
    }
    
    .ontowave-breadcrumb a:hover {
      text-decoration: underline;
    }
    
    .ontowave-breadcrumb span {
      color: #656d76;
      margin-right: 0.5rem;
    }
    
    .ontowave-status {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 2rem;
    }
    
    .ontowave-status h4 {
      margin: 0 0 0.5rem 0;
      color: #155724;
    }
    
    .ontowave-status ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #155724;
    }
    
    @media (max-width: 768px) {
      .ontowave-header {
        padding: 1rem;
      }
      
      .ontowave-header h1 {
        font-size: 2em;
      }
      
      .ontowave-nav-grid {
        grid-template-columns: 1fr;
      }
      
      .ontowave-content {
        padding: 1rem;
      }
    }
  `;

  class OntoWave {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.container = null;
      this.mermaidLoaded = false;
      this.prismLoaded = false;
      this.currentPage = null;
      
      console.log('🌊 OntoWave initialized with config:', this.config);
    }

    async init() {
      try {
        // Charger la configuration depuis le script JSON si disponible
        await this.loadConfigFromScript();
        
        // Injecter les styles CSS
        this.injectStyles();
        
        // Charger Mermaid si nécessaire
        await this.loadMermaid();
        
        // Charger Prism si nécessaire
        await this.loadPrism();
        
        // Créer l'interface
        this.createInterface();
        
        // Initialiser la navigation
        this.initializeNavigation();
        
        // Charger la page initiale
        await this.loadInitialPage();
        
        console.log('✅ OntoWave successfully initialized');
        
      } catch (error) {
        console.error('❌ OntoWave initialization failed:', error);
        this.showError('Erreur d\'initialisation OntoWave: ' + error.message);
      }
    }

    async loadConfigFromScript() {
      const configScript = document.getElementById('ontowave-config');
      if (configScript && configScript.type === 'application/json') {
        try {
          const userConfig = JSON.parse(configScript.textContent);
          this.config = { ...this.config, ...userConfig };
          console.log('📄 Configuration loaded from script tag');
        } catch (error) {
          console.warn('⚠️ Invalid JSON in ontowave-config script tag:', error);
        }
      }
    }

    injectStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = CSS_STYLES;
      document.head.appendChild(styleElement);
    }

    async loadMermaid() {
      return new Promise((resolve) => {
        if (window.mermaid) {
          this.mermaidLoaded = true;
          this.initializeMermaid();
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.onload = () => {
          this.mermaidLoaded = true;
          this.initializeMermaid();
          resolve();
        };
        script.onerror = () => {
          console.warn('⚠️ Failed to load Mermaid library');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    initializeMermaid() {
      if (window.mermaid) {
        window.mermaid.initialize(this.config.mermaid);
        console.log('🎨 Mermaid initialized');
      }
    }

    async loadPrism() {
      return new Promise((resolve) => {
        if (window.Prism) {
          this.prismLoaded = true;
          console.log('🎨 Prism already loaded');
          return resolve();
        }

        // Charger CSS Prism
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
        document.head.appendChild(cssLink);

        // Charger JS Prism
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js';
        script.onload = () => {
          // Marquer Prism comme chargé dès que le core est disponible
          this.prismLoaded = true;
          console.log('🎨 Prism core loaded');
          
          // Charger les composants pour langages populaires en arrière-plan
          const languages = ['markup', 'html', 'css', 'javascript', 'python', 'java', 'bash', 'json', 'yaml', 'typescript', 'php'];
          
          languages.forEach(lang => {
            const langScript = document.createElement('script');
            langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${lang}.min.js`;
            langScript.onload = () => {
              console.log(`🔤 Prism language loaded: ${lang}`);
            };
            langScript.onerror = () => {
              console.warn(`⚠️ Failed to load Prism language: ${lang}`);
            };
            document.head.appendChild(langScript);
          });
          
          resolve();
        };
        script.onerror = () => {
          console.warn('⚠️ Failed to load Prism library');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    createInterface() {
      // Trouver ou créer le conteneur
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = this.config.containerId;
        document.body.appendChild(this.container);
      }

      this.container.className = 'ontowave-container';
      
      // Créer la structure HTML minimaliste
      this.container.innerHTML = `
        <div class="ontowave-floating-menu" id="ontowave-floating-menu" title="OntoWave Menu">
          <span class="ontowave-menu-icon" id="ontowave-menu-icon">&#127754;</span>
          <div class="ontowave-menu-content" id="ontowave-menu-content">
            <a href="https://ontowave.com/" target="_blank" class="ontowave-menu-brand">OntoWave</a>
            <div class="ontowave-menu-options">
              <span class="ontowave-menu-option" onclick="window.OntoWave.loadPage('index.md')">🏠 Accueil</span>
              <span class="ontowave-menu-option" onclick="window.location.href='gallery.html'">🎨 Galerie</span>
            </div>
          </div>
        </div>
        
        <div class="ontowave-content" id="ontowave-content">
          <div class="ontowave-loading">⏳ Chargement du contenu...</div>
        </div>
        
        <div class="ontowave-status" style="display: none;">
          <h4>✅ OntoWave Package Actif</h4>
          <ul>
            <li><strong>Chargement rapide:</strong> Système intégré</li>
            <li><strong>Mermaid:</strong> ${this.mermaidLoaded ? 'Chargé' : 'Non disponible'}</li>
            <li><strong>Prism:</strong> ${this.prismLoaded ? 'Chargé' : 'Non disponible'}</li>
            <li><strong>PlantUML:</strong> Support intégré</li>
            <li><strong>Navigation:</strong> Hash préservé</li>
          </ul>
        </div>
      `;
    }

    initializeNavigation() {
      // Gestion des changements de hash
      window.addEventListener('hashchange', () => {
        const hash = location.hash.replace('#', '') || this.config.defaultPage;
        this.loadPage(hash);
      });

      // Navigation par défaut
      this.createDefaultNavigation();
      
      // Initialiser le menu flottant interactif
      this.initializeFloatingMenu();
    }

    initializeFloatingMenu() {
      const menu = document.getElementById('ontowave-floating-menu');
      const menuIcon = document.getElementById('ontowave-menu-icon');
      
      if (!menu || !menuIcon) return;

      let isExpanded = false;
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };

      // Toggle menu au clic sur l'icône
      menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          menu.classList.add('expanded');
        } else {
          menu.classList.remove('expanded');
        }
      });

      // Fermer le menu au clic en dehors
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && isExpanded) {
          isExpanded = false;
          menu.classList.remove('expanded');
        }
      });

      // Drag & Drop functionality
      menu.addEventListener('mousedown', (e) => {
        // Ne pas démarrer le drag si on clique sur les liens/boutons
        if (e.target.closest('a, .ontowave-menu-option')) return;
        
        isDragging = true;
        const rect = menu.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        menu.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        // Contraintes pour rester dans la fenêtre
        const maxX = window.innerWidth - menu.offsetWidth;
        const maxY = window.innerHeight - menu.offsetHeight;
        
        menu.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        menu.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          menu.style.cursor = 'move';
          document.body.style.userSelect = '';
        }
      });

      // Support tactile pour mobile
      menu.addEventListener('touchstart', (e) => {
        if (e.target.closest('a, .ontowave-menu-option')) return;
        
        const touch = e.touches[0];
        const rect = menu.getBoundingClientRect();
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
        isDragging = true;
      });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const x = touch.clientX - dragOffset.x;
        const y = touch.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - menu.offsetWidth;
        const maxY = window.innerHeight - menu.offsetHeight;
        
        menu.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        menu.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    createDefaultNavigation() {
      const navGrid = document.getElementById('ontowave-nav-grid');
      if (!navGrid) return;

      const defaultNavItems = [
        { href: 'index.md', icon: '🏠', label: 'Accueil' },
        { href: 'en/index.md', icon: '🇬🇧', label: 'English' },
        { href: 'fr/index.md', icon: '🇫🇷', label: 'Français' },
        { href: 'demo/mermaid.md', icon: '🎨', label: 'Démo Mermaid' },
        { href: 'demo/plantuml.md', icon: '📊', label: 'PlantUML' },
        { href: 'demo/advanced-shapes.md', icon: '🎯', label: 'Formes Avancées' }
      ];

      navGrid.innerHTML = defaultNavItems.map(item => `
        <a href="#${item.href}" class="ontowave-nav-item" onclick="window.OntoWave.loadPage('${item.href}')">
          ${item.icon} ${item.label}
        </a>
      `).join('');
    }

    async loadInitialPage() {
      const initialPage = location.hash.replace('#', '') || this.config.defaultPage;
      await this.loadPage(initialPage);
    }

    async loadPage(pagePath) {
      const contentDiv = document.getElementById('ontowave-content');
      if (!contentDiv) return;

      console.log('📄 Loading page:', pagePath);
      this.currentPage = pagePath;
      
      // Mettre à jour le hash
      if (location.hash !== '#' + pagePath) {
        location.hash = '#' + pagePath;
      }

      // Mettre à jour le breadcrumb
      this.updateBreadcrumb(pagePath);

      // Afficher le loading
      contentDiv.innerHTML = '<div class="ontowave-loading">⏳ Chargement de ' + pagePath + '...</div>';

      try {
        const response = await fetch(this.config.baseUrl + pagePath);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const markdown = await response.text();
        console.log('✅ Content loaded:', markdown.length, 'characters');

        // Rendre le markdown
        const html = await this.renderMarkdown(markdown);
        contentDiv.innerHTML = html;

        // Traiter les diagrammes
        await this.processDiagrams(contentDiv);

        // Traiter la coloration syntaxique
        await this.processPrism(contentDiv);

      } catch (error) {
        console.error('❌ Failed to load page:', error);
        this.showError(`Impossible de charger ${pagePath}: ${error.message}`);
      }
    }

    updateBreadcrumb(pagePath) {
      const breadcrumbDiv = document.getElementById('ontowave-breadcrumb');
      if (!breadcrumbDiv || !this.config.navigation.showBreadcrumb) return;

      const parts = pagePath.split('/');
      const breadcrumbs = ['<a href="#' + this.config.defaultPage + '">🏠 Accueil</a>'];
      
      let currentPath = '';
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Dernier élément (page actuelle)
          breadcrumbs.push('<span>' + part.replace('.md', '') + '</span>');
        } else {
          currentPath += (currentPath ? '/' : '') + part;
          breadcrumbs.push('<a href="#' + currentPath + '/index.md">' + part + '</a>');
        }
      });

      breadcrumbDiv.innerHTML = breadcrumbs.join(' <span>›</span> ');
      breadcrumbDiv.style.display = 'block';
    }

    async renderMarkdown(markdown) {
      // Rendu markdown corrigé avec support complet
      let html = markdown;
      
      // Traiter les blocs de code AVANT les autres transformations
      const codeBlocks = [];
      html = html.replace(/```(\w+)([\s\S]*?)```/g, (match, language, content) => {
        const trimmedContent = content.trim();
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        
        if (language === 'mermaid') {
          const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
          codeBlocks.push(`<div class="ontowave-mermaid mermaid" id="${id}">${trimmedContent}</div>`);
        } else if (language === 'plantuml') {
          const id = 'plantuml-' + Math.random().toString(36).substr(2, 9);
          const plantUMLUrl = `${this.config.plantuml.server}/${this.config.plantuml.format}/~1${encodeURIComponent(trimmedContent)}`;
          codeBlocks.push(`<div class="ontowave-plantuml" id="${id}">
            <div style="margin-bottom: 8px; font-weight: bold; color: #586069;">📊 Diagramme PlantUML</div>
            <img src="${plantUMLUrl}" alt="Diagramme PlantUML" style="max-width: 100%; height: auto;" 
                 onerror="this.parentElement.innerHTML='<div style=\\'color: #d73a49; padding: 20px;\\'>❌ Erreur de rendu PlantUML</div>'" />
          </div>`);
        } else {
          const codeClass = this.prismLoaded ? `language-${language}` : '';
          console.log(`📝 Processing code block: language="${language}", prismLoaded=${this.prismLoaded}, class="${codeClass}"`);
          codeBlocks.push(`<pre class="ontowave-code"><code class="${codeClass}">${trimmedContent}</code></pre>`);
        }
        
        return placeholder;
      });
      
      // Transformations markdown principales
      html = html
        // Headers - corriger l'ordre et la syntaxe
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Séparateurs HR
        .replace(/^---+$/gm, '<hr>')
        // Images markdown - avant les liens
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // Liens - traitement différent pour HTML vs MD
        .replace(/\[([^\]]+)\]\(([^)]+\.html[^)]*)\)/g, '<a href="$2">$1</a>')
        // Liens externes (http/https) - ne pas ajouter de hash
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Fichiers téléchargeables - liens directs sans hash
        .replace(/\[([^\]]+)\]\(([^)]+\.(tar\.gz|zip|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml|js|css|png|jpg|jpeg|gif|svg|webp)[^)]*)\)/g, '<a href="$2" download>$1</a>')
        // Liens internes - ajouter hash et navigation OntoWave
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="#$2" onclick="window.OntoWave.loadPage(\'$2\')">$1</a>')
        // Formatage
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code inline
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Paragraphes
        .split('\n\n')
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => {
          // Ne pas encapsuler dans <p> si c'est déjà un élément HTML
          if (para.match(/^<(h[1-6]|hr|div|pre)/)) {
            return para;
          }
          return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');
      
      // Remettre les blocs de code
      codeBlocks.forEach((block, index) => {
        html = html.replace(`__CODE_BLOCK_${index}__`, block);
      });

      return html;
    }

    async processDiagrams(container) {
      if (!this.mermaidLoaded || !window.mermaid) return;

      const mermaidElements = container.querySelectorAll('.mermaid');
      if (mermaidElements.length === 0) return;

      console.log('🎨 Processing', mermaidElements.length, 'Mermaid diagrams');

      try {
        // Nettoyer les éléments déjà traités
        mermaidElements.forEach(el => {
          el.removeAttribute('data-processed');
        });

        await window.mermaid.run();
        console.log('✅ Mermaid diagrams rendered successfully');

        // Vérification post-rendu
        setTimeout(() => {
          const svgElements = container.querySelectorAll('.mermaid svg');
          console.log('🎨 SVG elements found:', svgElements.length);
          
          if (svgElements.length === 0 && mermaidElements.length > 0) {
            console.log('⚠️ Retrying Mermaid rendering...');
            mermaidElements.forEach(el => {
              el.removeAttribute('data-processed');
            });
            window.mermaid.init(undefined, mermaidElements);
          }
        }, 1000);

      } catch (error) {
        console.error('❌ Mermaid rendering error:', error);
        // Fallback: afficher le code brut
        mermaidElements.forEach(el => {
          if (!el.querySelector('svg')) {
            el.innerHTML = `<div style="color: #d73a49; padding: 10px;">❌ Erreur de rendu Mermaid: ${error.message}</div><pre style="background: #f8f8f8; padding: 10px; margin-top: 10px; border-radius: 4px;"><code>${el.textContent}</code></pre>`;
          }
        });
      }
    }

    async processPrism(container) {
      console.log('🔍 processPrism called - prismLoaded:', this.prismLoaded, 'window.Prism:', !!window.Prism);
      
      if (!window.Prism) {
        console.log('🎨 Prism not available, skipping syntax highlighting');
        return;
      }

      try {
        // Trouver tous les blocs de code avec des classes de langue
        const codeElements = container.querySelectorAll('code[class*="language-"]');
        console.log('🎨 Found', codeElements.length, 'code blocks with language classes');
        
        // Aussi chercher les blocs sans classe pour debug
        const allCodeElements = container.querySelectorAll('code');
        console.log('📝 Total code blocks found:', allCodeElements.length);
        
        // Log des classes trouvées
        allCodeElements.forEach((el, i) => {
          console.log(`Code block ${i}: class="${el.className}", content="${el.textContent?.substring(0, 30)}..."`);
        });

        if (codeElements.length > 0) {
          window.Prism.highlightAllUnder(container);
          console.log('✅ Prism syntax highlighting applied to', codeElements.length, 'blocks');
          
          // Vérifier que la coloration a fonctionné
          const tokenElements = container.querySelectorAll('.token');
          console.log('🎨 Tokens created after highlighting:', tokenElements.length);
        } else {
          console.log('⚠️ No code blocks with language classes found for Prism');
        }
      } catch (error) {
        console.error('❌ Prism highlighting error:', error);
      }
    }

    showError(message) {
      const contentDiv = document.getElementById('ontowave-content');
      if (contentDiv) {
        contentDiv.innerHTML = `<div class="ontowave-error">❌ ${message}</div>`;
      }
    }

    // API publique
    navigate(page) {
      this.loadPage(page);
    }

    getConfig() {
      return { ...this.config };
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      console.log('📝 Configuration updated');
    }
  }

  // Initialisation automatique au chargement de la page
  document.addEventListener('DOMContentLoaded', () => {
    window.OntoWave = new OntoWave();
    window.OntoWave.init();
  });

  // Export pour utilisation manuelle si nécessaire
  window.OntoWaveClass = OntoWave;

})(window);
