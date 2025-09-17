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

  // Traductions pour l'interface
  const TRANSLATIONS = {
    fr: {
      // Menu
      menuHome: "Accueil",
      menuGallery: "Galerie", 
      menuConfiguration: "Configuration",
      
      // Panneau de configuration
      configTitle: "OntoWave - Configuration Complète",
      configGeneral: "Général",
      configSiteTitle: "Titre du site :",
      configDefaultPage: "Page par défaut :",
      configBaseUrl: "URL de base :",
      configLanguages: "Langues et Localisation",
      configSupportedLanguages: "Langues supportées (séparées par des virgules) :",
      configFallbackLanguage: "Langue de fallback :",
      configNavigation: "Navigation et Interface",
      configShowGallery: "Afficher la galerie d'exemples",
      configHomeButton: "Bouton Accueil",
      configBreadcrumb: "Fil d'Ariane (breadcrumb)",
      configToc: "Table des matières",
      configMermaid: "Diagrammes Mermaid",
      configMermaidTheme: "Thème Mermaid :",
      configMermaidAuto: "Démarrage automatique",
      configMermaidMaxWidth: "Utiliser la largeur maximale",
      configPlantuml: "Diagrammes PlantUML",
      configPlantumlServer: "Serveur PlantUML :",
      configPlantumlFormat: "Format de sortie :",
      configPrism: "Coloration Syntaxique (Prism.js)",
      configPrismTheme: "Thème Prism :",
      configPrismAutoload: "Chargement automatique",
      configUI: "Interface Utilisateur",
      configUITheme: "Thème de l'interface :",
      configUIResponsive: "Design responsive",
      configUIAnimations: "Animations et transitions",
      configApply: "Appliquer Configuration",
      configDownloadHTML: "Télécharger HTML",
      configDownloadJS: "Télécharger ontowave.min.js",
      configReset: "Réinitialiser",
      configLanguageNote: "Laissez vide pour un site monolingue"
    },
    en: {
      // Menu
      menuHome: "Home",
      menuGallery: "Gallery",
      menuConfiguration: "Configuration",
      
      // Configuration Panel
      configTitle: "OntoWave - Complete Configuration",
      configGeneral: "General",
      configSiteTitle: "Site title:",
      configDefaultPage: "Default page:",
      configBaseUrl: "Base URL:",
      configLanguages: "Languages and Localization",
      configSupportedLanguages: "Supported languages (comma separated):",
      configFallbackLanguage: "Fallback language:",
      configNavigation: "Navigation and Interface",
      configShowGallery: "Show examples gallery",
      configHomeButton: "Home button",
      configBreadcrumb: "Breadcrumb navigation",
      configToc: "Table of contents",
      configMermaid: "Mermaid Diagrams",
      configMermaidTheme: "Mermaid theme:",
      configMermaidAuto: "Auto start",
      configMermaidMaxWidth: "Use maximum width",
      configPlantuml: "PlantUML Diagrams",
      configPlantumlServer: "PlantUML server:",
      configPlantumlFormat: "Output format:",
      configPrism: "Syntax Highlighting (Prism.js)",
      configPrismTheme: "Prism theme:",
      configPrismAutoload: "Auto loading",
      configUI: "User Interface",
      configUITheme: "Interface theme:",
      configUIResponsive: "Responsive design",
      configUIAnimations: "Animations and transitions",
      configApply: "Apply Configuration",
      configDownloadHTML: "Download HTML",
      configDownloadJS: "Download ontowave.min.js",
      configReset: "Reset",
      configLanguageNote: "Leave empty for monolingual site"
    }
  };

  // Configuration par défaut
  const DEFAULT_CONFIG = {
    title: "OntoWave Documentation",
    baseUrl: "/",
    defaultPage: "index.md",
    containerId: "ontowave-container",
    locales: ["fr", "en"], // Langues supportées par défaut
    fallbackLocale: "en",
    showGallery: false, // Gallerie désactivée par défaut
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
      animations: true,
      languageButtons: "menu" // "fixed", "menu", "both"
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
    
    .ontowave-floating-menu.no-drag {
      cursor: default;
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
    
    /* Désactiver le zoom quand le panneau de configuration est ouvert */
    .ontowave-floating-menu.has-config-panel:hover {
      transform: none;
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
    
    .org-suffix {
      font-size: 0.7em;
      opacity: 0.7;
      font-weight: normal;
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
      pointer-events: auto;
    }
    
    .ontowave-menu-option:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }
    
    .ontowave-menu-option.selected {
      background: #0969da;
      color: white;
      border-color: #0969da;
      box-shadow: 0 2px 8px rgba(9, 105, 218, 0.3);
    }
    
    .ontowave-menu-option.selected:hover {
      background: #0550ae;
      border-color: #0550ae;
      transform: translateY(-1px);
    }
    
    /* Styles pour les boutons de langue */
    .ontowave-lang-btn {
      font-weight: bold;
      font-size: 11px;
    }
    
    .ontowave-lang-btn.active {
      background: #28a745;
      color: white;
      border-color: #28a745;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }
    
    .ontowave-lang-btn.active:hover {
      background: #1e7e34;
      border-color: #1e7e34;
    }
    
    /* Boutons de langue fixés - nouveaux styles */
    .ontowave-fixed-lang-buttons {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999;
      display: flex;
      gap: 8px;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px 12px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Responsive : adaptation mobile */
    @media (max-width: 768px) {
      .ontowave-fixed-lang-buttons {
        top: 10px;
        right: 10px;
        padding: 6px 8px;
        gap: 4px;
      }
    }
    
    .ontowave-fixed-lang-btn {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 40px;
      justify-content: center;
    }
    
    /* Responsive : boutons plus petits sur mobile */
    @media (max-width: 768px) {
      .ontowave-fixed-lang-btn {
        padding: 4px 8px;
        font-size: 11px;
        min-width: 35px;
        gap: 2px;
      }
    }
    
    .ontowave-fixed-lang-btn:hover {
      background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .ontowave-fixed-lang-btn.active {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    }
    
    .ontowave-fixed-lang-btn.active:hover {
      background: linear-gradient(135deg, #1e7e34 0%, #198754 100%);
      transform: translateY(-2px);
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
    
    .ontowave-content h4 {
      color: #24292e;
      margin-top: 16px;
      margin-bottom: 10px;
      font-size: 1.1em;
      font-weight: 600;
    }
    
    .ontowave-content h5 {
      color: #24292e;
      margin-top: 14px;
      margin-bottom: 8px;
      font-size: 1em;
      font-weight: 600;
    }
    
    .ontowave-content h6 {
      color: #24292e;
      margin-top: 12px;
      margin-bottom: 6px;
      font-size: 0.9em;
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
      
      // Support pour le format i18n (compatibilité avec config.json)
      if (config.i18n) {
        if (config.i18n.supported) {
          this.config.locales = config.i18n.supported;
        }
        if (config.i18n.default) {
          this.config.fallbackLocale = config.i18n.default;
        }
      }
      
      this.container = null;
      this.mermaidLoaded = false;
      this.prismLoaded = false;
      this.currentPage = null;
      this.currentLanguage = null; // Langue courante stockée
    }

    /**
     * Détecte la langue actuelle de l'interface
     */
    getCurrentLanguage() {
      // Si une langue a été explicitement définie, l'utiliser
      if (this.currentLanguage) {
        return this.currentLanguage;
      }
      
      // Vérifier s'il y a une langue sélectionnée dans l'interface
      const langFr = document.getElementById('lang-fr');
      const langEn = document.getElementById('lang-en');
      
      if (langFr && langEn) {
        // Système multilingue détecté - vérifier les classes visible/hidden
        if (langFr.classList.contains('visible') || (!langFr.classList.contains('hidden') && langFr.style.display !== 'none')) {
          return 'fr';
        } else if (langEn.classList.contains('visible') || (!langEn.classList.contains('hidden') && langEn.style.display !== 'none')) {
          return 'en';
        }
      }
      
      // Fallback - vérifier les boutons actifs
      const btnFr = document.getElementById('btn-fr');
      const btnEn = document.getElementById('btn-en');
      
      if (btnFr && btnEn) {
        if (btnFr.classList.contains('active')) {
          return 'fr';
        } else if (btnEn.classList.contains('active')) {
          return 'en';
        }
      }
      
      // Fallback sur les préférences du navigateur
      return this.resolveLocale() || 'en';
    }

    /**
     * Obtient une traduction pour une langue spécifique ou la langue actuelle
     */
    t(key, locale = null) {
      const targetLang = locale || this.getCurrentLanguage();
      const translations = TRANSLATIONS[targetLang] || TRANSLATIONS['en'];
      return translations[key] || key;
    }

    /**
     * Met à jour tous les textes de l'interface selon une langue spécifique
     */
    updateInterfaceTexts(locale = null) {
      const targetLang = locale || this.getCurrentLanguage();
      console.log('🌐 Interface texts updating for language:', targetLang);
      
      // Mettre à jour les textes du menu
      const homeOption = document.querySelector('.ontowave-menu-option[onclick*="goHome"]');
      if (homeOption) {
        homeOption.innerHTML = `🏠 ${this.t('menuHome', targetLang)}`;
      }

      const galleryOption = document.querySelector('.ontowave-menu-option[onclick*="gallery.html"]');
      if (galleryOption) {
        galleryOption.innerHTML = `🎨 ${this.t('menuGallery', targetLang)}`;
      }

      const configOption = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
      if (configOption) {
        configOption.innerHTML = `⚙️ ${this.t('menuConfiguration', targetLang)}`;
      }

      // Si le panneau de configuration est ouvert, le recréer avec les nouveaux textes
      const configPanel = document.getElementById('ontowave-config-panel');
      if (configPanel) {
        // Sauvegarder l'état des champs avant de recréer le panneau
        const titleValue = document.getElementById('config-title-full')?.value || this.config.title;
        const defaultPageValue = document.getElementById('config-defaultPage-full')?.value || this.config.defaultPage;
        const baseUrlValue = document.getElementById('config-baseUrl-full')?.value || this.config.baseUrl;
        
        // Fermer et rouvrir le panneau pour le mettre à jour
        configPanel.remove();
        const configButton = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
        if (configButton) {
          configButton.classList.remove('selected');
        }
        
        // Rouvrir avec les nouvelles traductions et la langue spécifiée
        setTimeout(() => {
          this.toggleConfigurationPanel(null, targetLang);
          
          // Restaurer les valeurs des champs
          setTimeout(() => {
            const titleField = document.getElementById('config-title-full');
            const defaultPageField = document.getElementById('config-defaultPage-full');
            const baseUrlField = document.getElementById('config-baseUrl-full');
            
            if (titleField) titleField.value = titleValue;
            if (defaultPageField) defaultPageField.value = defaultPageValue;
            if (baseUrlField) baseUrlField.value = baseUrlValue;
          }, 100);
        }, 50);
      }

      console.log('🌐 Interface texts updated for language:', targetLang);
    }

    /**
     * Change la langue de l'interface et recharge le contenu approprié
     */
    switchLanguage(targetLang) {
      // Stocker la langue courante
      this.currentLanguage = targetLang;
      
      // Mettre à jour l'état des boutons de langue
      this.updateLanguageButtonsState(targetLang);
      
      // Mettre à jour l'interface
      this.updateInterfaceTexts(targetLang);
      
      // Recharger la page avec la bonne langue
      const sources = this.config.sources || {};
      const targetPage = sources[targetLang] || this.config.defaultPage;
      
      if (targetPage) {
        this.loadPage(targetPage);
      }
    }

    /**
     * Met à jour l'état visuel des boutons de langue pour refléter la langue actuelle
     */
    updateLanguageButtonsState(currentLang = null) {
      const lang = currentLang || this.getCurrentLanguage();
      
      // Mettre à jour les boutons de langue dans le menu
      document.querySelectorAll('.ontowave-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang.toUpperCase())) {
          btn.classList.add('active');
        }
      });
      
      // Mettre à jour les boutons de langue fixés
      document.querySelectorAll('.ontowave-fixed-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang.toUpperCase())) {
          btn.classList.add('active');
        }
      });
      
      console.log('🌐 État des boutons de langue mis à jour pour:', lang);
    }

    /**
     * Charge la page d'accueil dans la langue courante
     */
    goHome() {
      const currentLang = this.getCurrentLanguage();
      const sources = this.config.sources || {};
      const homePage = sources[currentLang] || this.config.defaultPage;
      this.loadPage(homePage);
    }

    /**
     * Résout les langues du navigateur par ordre de préférence
     */
    getBrowserLocales() {
      const languages = [];
      
      // navigator.languages (préférences utilisateur)
      if (navigator.languages) {
        languages.push(...navigator.languages);
      }
      
      // Fallbacks
      if (navigator.language) {
        languages.push(navigator.language);
      }
      if (navigator.userLanguage) {
        languages.push(navigator.userLanguage);
      }
      
      return [...new Set(languages)]; // Enlever doublons
    }

    /**
     * Trouve la meilleure correspondance entre langues navigateur et config
     * Priorise maintenant le contexte de la page, puis les préférences du navigateur
     */
    resolveLocale() {
      const browserLocales = this.getBrowserLocales();
      const supportedLocales = this.config.locales || [];
      const defaultLocale = this.config.defaultLocale || this.config.fallbackLocale;
      
      console.log('🌐 Browser locales:', browserLocales);
      console.log('🌐 Supported locales:', supportedLocales);
      console.log('🌐 Default locale:', defaultLocale);
      
      if (supportedLocales.length === 0) {
        return null; // Mode monolingue
      }
      
      // PRIORITÉ 1 : Détecter la langue depuis l'URL actuelle
      const currentUrl = window.location.hash || window.location.pathname;
      console.log('🔍 Current URL:', currentUrl);
      
      for (const locale of supportedLocales) {
        // Rechercher des patterns comme index.fr.md, about.en.md, etc.
        const langPattern = new RegExp(`\\.${locale}\\.(md|html)`);
        if (langPattern.test(currentUrl)) {
          console.log('🎯 Page language detected from URL:', locale, 'in', currentUrl);
          return locale;
        }
      }
      
      // PRIORITÉ 2 : Recherche exacte dans les langues navigateur
      for (const browserLang of browserLocales) {
        if (supportedLocales.includes(browserLang)) {
          console.log('🎯 Exact browser match found:', browserLang);
          return browserLang;
        }
      }
      
      // PRIORITÉ 2 : Recherche par préfixe (fr-CA -> fr)
      for (const browserLang of browserLocales) {
        const prefix = browserLang.split('-')[0];
      
      // PRIORITÉ 3 : Recherche par préfixe (fr-CA -> fr)
      for (const browserLang of browserLocales) {
        const prefix = browserLang.split('-')[0];
        const match = supportedLocales.find(locale => locale.startsWith(prefix));
        if (match) {
          console.log('🎯 Prefix match found:', browserLang, '->', match);
          return match;
        }
      }
      
      // PRIORITÉ 4 : Utiliser defaultLocale si défini et supporté
      if (defaultLocale && supportedLocales.includes(defaultLocale)) {
        console.log('🎯 Using configured default locale:', defaultLocale);
        return defaultLocale;
      }
      
      // PRIORITÉ 5 : Fallback sur la première langue supportée
      }
      
      // PRIORITÉ 4 : Fallback sur la première langue supportée
      const fallback = supportedLocales[0];
      console.log('🎯 Using fallback locale:', fallback);
      return fallback;
    }

    /**
     * Détermine si OntoWave est en mode multilingue
     */
    isMultilingualMode() {
      return this.config.locales && this.config.locales.length > 0 && this.config.sources;
    }

    /**
     * Génère la liste des fichiers à essayer pour une page donnée
     */
    generatePageCandidates(basePage) {
      const resolvedLocale = this.resolveLocale();
      const candidates = [];
      
      if (!resolvedLocale) {
        // Mode monolingue - essayer la page directement
        candidates.push(basePage);
        return candidates;
      }
      
      const pageName = basePage.replace(/\.md$/, '');
      
      // Essayer avec la locale résolue
      candidates.push(`${pageName}.${resolvedLocale}.md`);
      
      // Si c'est une locale composée (fr-CA), essayer le préfixe
      if (resolvedLocale.includes('-')) {
        const prefix = resolvedLocale.split('-')[0];
        candidates.push(`${pageName}.${prefix}.md`);
      }
      
      // Fallback sur la page de base
      candidates.push(basePage);
      
      console.log('📄 Page candidates for', basePage, ':', candidates);
      return candidates;
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
        
        // Initialiser la langue courante
        this.currentLanguage = this.resolveLocale();
        
        // Initialiser la navigation
        this.initializeNavigation();
        
        // Mettre à jour l'état des boutons de langue après la création du menu
        this.updateLanguageButtonsState();
        
        // Charger la page initiale
        await this.loadInitialPage();
        
        console.log('✅ OntoWave successfully initialized');
        
      } catch (error) {
        console.error('❌ OntoWave initialization failed:', error);
        this.showError('Erreur d\'initialisation OntoWave: ' + error.message);
      }
    }

    async loadConfigFromScript() {
      // Priorité 1: Chercher dans window.ontoWaveConfig
      if (window.ontoWaveConfig) {
        this.config = { ...this.config, ...window.ontoWaveConfig };
        console.log('📄 Configuration loaded from window.ontoWaveConfig');
        console.log('📄 Final config:', this.config);
        return;
      }
      
      // Priorité 2: Chercher dans script tag
      const configScript = document.getElementById('ontowave-config');
      if (configScript && configScript.type === 'application/json') {
        try {
          const userConfig = JSON.parse(configScript.textContent);
          this.config = { ...this.config, ...userConfig };
          console.log('📄 Configuration loaded from script tag');
          console.log('📄 Final config:', this.config);
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
          console.log('🎨 Prism core loaded');
          
          // Charger les langages essentiels et attendre leur chargement
          const essentialLanguages = ['markup', 'css', 'javascript'];
          let loadedCount = 0;
          
          const checkComplete = () => {
            loadedCount++;
            console.log(`🔤 Essential language loaded: ${loadedCount}/${essentialLanguages.length}`);
            if (loadedCount >= essentialLanguages.length) {
              // HTML est un alias de markup dans Prism
              if (window.Prism.languages.markup) {
                window.Prism.languages.html = window.Prism.languages.markup;
                console.log('🔤 HTML alias created from markup');
              }
              
              this.prismLoaded = true;
              console.log('✅ Prism ready with essential languages');
              resolve();
              
              // Charger les langages supplémentaires en arrière-plan
              const additionalLanguages = ['python', 'java', 'bash', 'json', 'yaml', 'typescript'];
              additionalLanguages.forEach(lang => {
                const langScript = document.createElement('script');
                langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${lang}.min.js`;
                langScript.onload = () => {
                  console.log(`🔤 Additional Prism language loaded: ${lang}`);
                };
                langScript.onerror = () => {
                  console.warn(`⚠️ Failed to load Prism language: ${lang}`);
                };
                document.head.appendChild(langScript);
              });
            }
          };
          
          essentialLanguages.forEach(lang => {
            const langScript = document.createElement('script');
            langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${lang}.min.js`;
            langScript.onload = checkComplete;
            langScript.onerror = () => {
              console.warn(`⚠️ Failed to load essential Prism language: ${lang}`);
              checkComplete(); // Continue même en cas d'erreur
            };
            document.head.appendChild(langScript);
          });
        };
        script.onerror = () => {
          console.warn('⚠️ Failed to load Prism library');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    createInterface(locale = null) {
      // Trouver ou créer le conteneur
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = this.config.containerId;
        document.body.appendChild(this.container);
      }

      this.container.className = 'ontowave-container';
      
      // Créer les options du menu selon la configuration
      const galleryOption = this.config.showGallery ? 
        `<span class="ontowave-menu-option" onclick="window.location.href='gallery.html'">🎨 ${this.t('menuGallery', locale)}</span>` : '';
      
      // Créer les boutons de langue si multilingue et selon la configuration
      const languageButtonsMode = this.config.ui?.languageButtons || "menu";
      const shouldCreateMenuButtons = (languageButtonsMode === "menu" || languageButtonsMode === "both");
      
      const languageButtons = this.config.locales && this.config.locales.length > 1 && shouldCreateMenuButtons ?
        this.config.locales.map(lang => {
          const isActive = (locale || this.getCurrentLanguage()) === lang;
          const activeClass = isActive ? ' active' : '';
          return `<span class="ontowave-menu-option ontowave-lang-btn${activeClass}" onclick="event.stopPropagation(); window.OntoWave.instance.switchLanguage('${lang}');">🌐 ${lang.toUpperCase()}</span>`;
        }).join('') : '';
      
      // Créer la structure HTML minimaliste
      this.container.innerHTML = `
        <div class="ontowave-floating-menu" id="ontowave-floating-menu" title="OntoWave Menu">
          <span class="ontowave-menu-icon" id="ontowave-menu-icon">&#127754;</span>
          <div class="ontowave-menu-content" id="ontowave-menu-content">
            <a href="https://ontowave.org/" target="_blank" class="ontowave-menu-brand">OntoWave<span class="org-suffix">.org</span></a>
            <div class="ontowave-menu-options">
              <span class="ontowave-menu-option" onclick="window.OntoWave.instance.goHome()">🏠 ${this.t('menuHome', locale)}</span>
              ${galleryOption}
              ${languageButtons}
              <span class="ontowave-menu-option" onclick="event.stopPropagation(); window.OntoWave.instance.toggleConfigurationPanel(event, '${locale || this.getCurrentLanguage()}');">⚙️ ${this.t('menuConfiguration', locale)}</span>
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
      
      // Créer les boutons de langue fixés si multilingue
      this.createFixedLanguageButtons(locale);
    }

    createFixedLanguageButtons(locale = null) {
      // Supprimer les boutons existants s'ils existent
      const existingButtons = document.getElementById('ontowave-fixed-lang-buttons');
      if (existingButtons) {
        existingButtons.remove();
      }
      
      // Créer les boutons de langue fixés seulement si multilingue et si configuré
      const languageButtonsMode = this.config.ui?.languageButtons || "menu";
      const shouldCreateFixed = (languageButtonsMode === "fixed" || languageButtonsMode === "both");
      
      if (this.config.locales && this.config.locales.length > 1 && shouldCreateFixed) {
        const currentLang = locale || this.getCurrentLanguage();
        
        const fixedLangContainer = document.createElement('div');
        fixedLangContainer.id = 'ontowave-fixed-lang-buttons';
        fixedLangContainer.className = 'ontowave-fixed-lang-buttons';
        
        // Créer les boutons pour chaque langue
        const buttonsHtml = this.config.locales.map(lang => {
          const isActive = currentLang === lang;
          const activeClass = isActive ? ' active' : '';
          const flag = this.getLanguageFlag(lang);
          return `<button class="ontowave-fixed-lang-btn${activeClass}" onclick="window.OntoWave.instance.switchLanguage('${lang}')" title="Changer en ${lang.toUpperCase()}">${flag} ${lang.toUpperCase()}</button>`;
        }).join('');
        
        fixedLangContainer.innerHTML = buttonsHtml;
        document.body.appendChild(fixedLangContainer);
        
        console.log('🌐 Boutons de langue fixés créés:', this.config.locales, 'Mode:', languageButtonsMode);
      }
    }
    
    getLanguageFlag(lang) {
      const flags = {
        'fr': '🇫🇷',
        'en': '🇬🇧',
        'es': '🇪🇸',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'zh': '🇨🇳',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'ru': '🇷🇺'
      };
      return flags[lang] || '🌐';
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

      // Fonction pour mettre à jour l'état de déplacement
      function updateDragState() {
        const canDrag = !isExpanded && !document.querySelector('.ontowave-config-panel');
        if (canDrag) {
          menu.classList.remove('no-drag');
        } else {
          menu.classList.add('no-drag');
          // Sécurité : forcer l'arrêt du drag
          isDragging = false;
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
        }
      }

      // Stocker la référence globalement pour les panneaux de configuration
      window.ontowaveUpdateDragState = updateDragState;

      // Toggle menu au clic sur l'icône
      menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          menu.classList.add('expanded');
        } else {
          menu.classList.remove('expanded');
        }
        updateDragState();
      });

      // Fermer le menu au clic en dehors
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && isExpanded) {
          isExpanded = false;
          menu.classList.remove('expanded');
          updateDragState();
        }
      });

      // Drag & Drop functionality
      menu.addEventListener('mousedown', (e) => {
        // Ne pas démarrer le drag si le menu est étendu ou si un panneau de config est ouvert
        if (isExpanded || document.querySelector('.ontowave-config-panel')) {
          return;
        }
        
        // Ne pas démarrer le drag si on clique sur les liens/boutons
        if (e.target.closest('a, .ontowave-menu-option')) return;
        
        isDragging = true;
        const rect = menu.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        menu.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        // Empêcher l'interception des événements par d'autres éléments
        e.preventDefault();
        e.stopPropagation();
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

      // Solution de sécurité : Remettre l'état normal après un délai
      function resetDragState() {
        isDragging = false;
        menu.style.cursor = 'move';
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }

      // Reset automatique après perte de focus ou changement de page
      document.addEventListener('visibilitychange', resetDragState);
      window.addEventListener('blur', resetDragState);
      window.addEventListener('focus', resetDragState);
      
      // Fonction globale accessible pour reset manuel
      window.resetOntoWaveDragState = resetDragState;

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
      
      // Initialiser l'état de déplacement
      updateDragState();
      
      // Améliorer la gestion des clics sur les options du menu
      this.enhanceMenuOptionClicks();
    }
    
    enhanceMenuOptionClicks() {
      // Ajouter des gestionnaires d'événements robustes pour les options du menu
      const configOption = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
      if (configOption) {
        configOption.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Configuration button clicked via event listener');
          this.toggleConfigurationPanel(e);
        }, { capture: true });
      }
    }

    createDefaultNavigation() {
      const navGrid = document.getElementById('ontowave-nav-grid');
      if (!navGrid) return;

      const defaultNavItems = [
        { href: 'index.md', icon: '🏠', label: 'Accueil' },
        { href: 'en/index.md', icon: '🇬🇧', label: 'English' },
        { href: 'fr/index.md', icon: '🇫🇷', label: 'Français' },
        { href: 'demo/mermaid.md', icon: '🧜‍♀️', label: 'Démo Mermaid' },
        { href: 'demo/plantuml.md', icon: '🏭', label: 'PlantUML' },
        { href: 'demo/advanced-shapes.md', icon: '🎯', label: 'Formes Avancées' }
      ];

      navGrid.innerHTML = defaultNavItems.map(item => `
        <a href="#${item.href}" class="ontowave-nav-item" onclick="window.OntoWave.loadPage('${item.href}')">
          ${item.icon} ${item.label}
        </a>
      `).join('');
    }

    async loadInitialPage() {
      const currentHash = location.hash.replace('#', '');
      
      // Mode multilingue : redirection automatique si pas de hash
      if (this.isMultilingualMode() && !currentHash) {
        const defaultSource = this.config.sources[this.config.defaultLocale];
        console.log('🌐 Multilingual mode detected');
        console.log('🌐 Default locale:', this.config.defaultLocale);
        console.log('🌐 Default source:', defaultSource);
        console.log('🌐 Sources config:', this.config.sources);
        
        if (defaultSource) {
          console.log('🌐 Multilingual mode: redirecting to', defaultSource);
          location.hash = '#' + defaultSource;
          return;
        }
      }
      
      const initialPage = currentHash || this.config.defaultPage;
      
      // Si on n'a pas de fichier index, afficher la configuration
      if (initialPage === 'index.md') {
        const candidates = this.generatePageCandidates(initialPage);
        let found = false;
        
        for (const candidate of candidates) {
          try {
            const response = await fetch(this.config.baseUrl + candidate, { method: 'HEAD' });
            if (response.ok) {
              await this.loadPage(candidate);
              found = true;
              break;
            }
          } catch (error) {
            // Continue avec le candidat suivant
            continue;
          }
        }
        
        if (!found) {
          console.log('📄 No index file found, showing configuration');
          this.showConfigurationInterface();
          return;
        }
      } else {
        await this.loadPage(initialPage);
      }
    }

    async loadPage(pagePath) {
      const contentDiv = document.getElementById('ontowave-content');
      if (!contentDiv) return;

      console.log('📄 Loading page:', pagePath);
      this.currentPage = pagePath;
      
      // Sécurité : Reset de l'état de drag au changement de page
      if (window.resetOntoWaveDragState) {
        window.resetOntoWaveDragState();
      }
      
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
          codeBlocks.push(`<div class="ontowave-mermaid">
            <div style="margin-bottom: 8px; font-weight: bold; color: #586069;">🧜‍♀️ Diagramme Mermaid</div>
            <div class="mermaid" id="${id}">${trimmedContent}</div>
          </div>`);
        } else if (language === 'plantuml') {
          const id = 'plantuml-' + Math.random().toString(36).substr(2, 9);
          
          // Fonction d'encodage PlantUML avec support UTF-8
          function encodePlantUML(text) {
            // Encoder le texte en UTF-8 puis en hexadécimal
            const utf8Encoder = new TextEncoder();
            const utf8Bytes = utf8Encoder.encode(text);
            let hex = '';
            for (let i = 0; i < utf8Bytes.length; i++) {
              hex += utf8Bytes[i].toString(16).padStart(2, '0');
            }
            return 'h' + hex; // Le préfixe ~h sera ajouté dans l'URL
          }
          
          const encodedContent = encodePlantUML(trimmedContent);
          const plantUMLUrl = `${this.config.plantuml.server}/${this.config.plantuml.format}/~${encodedContent}`;
          codeBlocks.push(`<div class="ontowave-plantuml" id="${id}">
            <div style="margin-bottom: 8px; font-weight: bold; color: #586069;">🏭 Diagramme PlantUML</div>
            <img src="${plantUMLUrl}" alt="Diagramme PlantUML" style="max-width: 100%; height: auto;" 
                 onerror="this.parentElement.innerHTML='<div style=\\'color: #d73a49; padding: 20px;\\'>❌ Erreur de rendu PlantUML</div>'" />
          </div>`);
        } else {
          const codeClass = this.prismLoaded ? `language-${language}` : '';
          console.log(`📝 Processing code block: language="${language}", prismLoaded=${this.prismLoaded}, class="${codeClass}"`);
          
          // Échapper le HTML pour que Prism puisse le colorer correctement
          const escapedContent = trimmedContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          
          codeBlocks.push(`<pre class="ontowave-code"><code class="${codeClass}">${escapedContent}</code></pre>`);
        }
        
        return placeholder;
      });
      
      // Transformations markdown principales
      html = html
        // Headers - corriger l'ordre et la syntaxe (du plus spécifique au plus général)
        .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
        .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
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
        // Vérifier les langages disponibles
        console.log('🔤 Available Prism languages:', window.Prism.languages ? Object.keys(window.Prism.languages) : 'none');
        
        // Trouver tous les blocs de code avec des classes de langue
        const codeElements = container.querySelectorAll('code[class*="language-"]');
        console.log('🎨 Found', codeElements.length, 'code blocks with language classes');
        
        // Debug détaillé de chaque bloc de code
        codeElements.forEach((el, i) => {
          console.log(`🔍 Code block ${i}:`);
          console.log(`  - class: "${el.className}"`);
          console.log(`  - content length: ${el.textContent?.length}`);
          console.log(`  - content preview: "${el.textContent?.substring(0, 50)}..."`);
          console.log(`  - parent visible: ${window.getComputedStyle(el.parentElement).display !== 'none'}`);
          console.log(`  - element visible: ${window.getComputedStyle(el).display !== 'none'}`);
        });
        
        // Aussi chercher les blocs sans classe pour debug
        const allCodeElements = container.querySelectorAll('code');
        console.log('📝 Total code blocks found:', allCodeElements.length);

        if (codeElements.length > 0) {
          // Tenter manuellement sur le premier élément pour debug
          const firstElement = codeElements[0];
          console.log('🧪 Testing manual highlighting on first element...');
          
          // Vérifier le langage
          const classList = firstElement.className.split(' ');
          const langClass = classList.find(cls => cls.startsWith('language-'));
          const lang = langClass ? langClass.replace('language-', '') : 'unknown';
          console.log(`🔤 Language detected: "${lang}"`);
          console.log(`🔤 Language available in Prism: ${!!(window.Prism.languages && window.Prism.languages[lang])}`);
          
          // Test manuel
          if (window.Prism.languages && window.Prism.languages[lang]) {
            console.log('🧪 Attempting manual highlight...');
            const originalContent = firstElement.textContent;
            try {
              const highlighted = window.Prism.highlight(originalContent, window.Prism.languages[lang], lang);
              console.log(`🎨 Manual highlight result length: ${highlighted.length}`);
              console.log(`🎨 Manual highlight preview: "${highlighted.substring(0, 100)}..."`);
              
              // Appliquer le résultat
              firstElement.innerHTML = highlighted;
              console.log('✅ Manual highlight applied');
            } catch (manualError) {
              console.error('❌ Manual highlight failed:', manualError);
            }
          }
          
          // Puis essayer la méthode normale
          window.Prism.highlightAllUnder(container);
          console.log('✅ Prism syntax highlighting applied to', codeElements.length, 'blocks');
          
          // Vérifier que la coloration a fonctionné
          const tokenElements = container.querySelectorAll('.token');
          console.log('🎨 Tokens created after highlighting:', tokenElements.length);
          
          // Debug des tokens créés
          if (tokenElements.length > 0) {
            tokenElements.forEach((token, i) => {
              console.log(`Token ${i}: "${token.textContent}" (class: ${token.className})`);
            });
          }
        } else {
          console.log('⚠️ No code blocks with language classes found for Prism');
        }
      } catch (error) {
        console.error('❌ Prism highlighting error:', error);
      }
    }

    showConfigurationInterface() {
      const contentDiv = document.getElementById('ontowave-content');
      if (!contentDiv) return;

      const currentConfigString = JSON.stringify(this.config, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      contentDiv.innerHTML = `
        <div class="ontowave-config-interface">
          <div class="config-header">
            <h1>🌊 OntoWave Configuration</h1>
            <p>Aucun fichier index trouvé. Configurez OntoWave pour votre projet :</p>
          </div>
          
          <div class="config-content">
            <div class="config-form">
              <h2>📝 Configuration</h2>
              
              <div class="form-group">
                <label for="config-title">Titre du site :</label>
                <input type="text" id="config-title" />
              </div>
              
              <div class="form-group">
                <label for="config-defaultPage">Page par défaut :</label>
                <input type="text" id="config-defaultPage" />
              </div>
              
              <div class="form-group">
                <label for="config-locales">Langues supportées (séparées par des virgules) :</label>
                <input type="text" id="config-locales" placeholder="fr-CA, fr, en" />
              </div>
              
              <div class="form-group">
                <label>
                  <input type="checkbox" id="config-showGallery" />
                  Afficher la galerie d'exemples
                </label>
              </div>
              
              <div class="form-group">
                <label for="config-mermaidTheme">Thème Mermaid :</label>
                <select id="config-mermaidTheme">
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="forest">Forest</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button onclick="window.OntoWave.instance.updateConfigFromForm()">✅ Appliquer</button>
                <button onclick="window.OntoWave.instance.downloadConfig()">💾 Télécharger HTML</button>
                <button onclick="window.OntoWave.instance.resetConfig()">🔄 Reset</button>
              </div>
            </div>
            
            <div class="config-code">
              <h2>💻 Code HTML généré</h2>
              <div class="code-preview">
                <pre><code id="generated-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${currentConfigString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
              </div>
              
              <div class="usage-info">
                <h3>📋 Instructions d'utilisation</h3>
                <ol>
                  <li>Configurez les options dans le formulaire</li>
                  <li>Cliquez sur "Télécharger HTML" pour obtenir votre fichier</li>
                  <li>Placez vos fichiers .md dans le même dossier</li>
                  <li>Ouvrez le fichier HTML dans votre navigateur</li>
                </ol>
                
                <h3>🌐 Gestion des langues</h3>
                <ul>
                  <li><strong>Monolingue :</strong> Laissez "Langues supportées" vide</li>
                  <li><strong>Multilingue :</strong> Ajoutez les codes de langue (ex: fr, en, fr-CA)</li>
                  <li><strong>Fichiers :</strong> index.fr.md, index.en.md, etc.</li>
                  <li><strong>Fallback :</strong> index.md si aucune langue trouvée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;

      // Ajouter les styles pour l'interface de configuration
      this.addConfigStyles();
      
      // Remplir les valeurs des champs après génération du HTML (une seule fois)
      this.populateConfigForm();
      
      // Générer le code HTML initial
      this.updateGeneratedCode();
    }
    
    // Méthode pour remplir les valeurs du formulaire
    populateConfigForm() {
      const titleField = document.getElementById('config-title');
      const defaultPageField = document.getElementById('config-defaultPage');
      const localesField = document.getElementById('config-locales');
      const showGalleryField = document.getElementById('config-showGallery');
      const mermaidThemeField = document.getElementById('config-mermaidTheme');
      
      if (titleField) titleField.value = this.config.title;
      if (defaultPageField) defaultPageField.value = this.config.defaultPage;
      if (localesField) localesField.value = this.config.locales.join(', ');
      if (showGalleryField) showGalleryField.checked = this.config.showGallery;
      if (mermaidThemeField) mermaidThemeField.value = this.config.mermaid.theme;
    }

    addConfigStyles() {
      if (document.getElementById('ontowave-config-styles')) return;

      const style = document.createElement('style');
      style.id = 'ontowave-config-styles';
      style.textContent = `
        .ontowave-config-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .config-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .config-header h1 {
          color: #0969da;
          margin-bottom: 10px;
        }
        
        .config-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        
        .config-form {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e1e4e8;
        }
        
        .config-code {
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e1e4e8;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #24292e;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }
        
        .form-actions button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .form-actions button:first-child {
          background: #28a745;
          color: white;
        }
        
        .form-actions button:nth-child(2) {
          background: #0969da;
          color: white;
        }
        
        .form-actions button:last-child {
          background: #6c757d;
          color: white;
        }
        
        .form-actions button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .code-preview {
          background: #f6f8fa;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin-bottom: 20px;
        }
        
        .code-preview pre {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .usage-info h3 {
          color: #0969da;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        
        .usage-info ul, .usage-info ol {
          padding-left: 20px;
        }
        
        .usage-info li {
          margin-bottom: 5px;
        }
        
        @media (max-width: 768px) {
          .config-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }

    updateConfigFromForm() {
      // Mettre à jour la configuration depuis le formulaire
      const title = document.getElementById('config-title').value;
      const defaultPage = document.getElementById('config-defaultPage').value;
      const locales = document.getElementById('config-locales').value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      const showGallery = document.getElementById('config-showGallery').checked;
      const mermaidTheme = document.getElementById('config-mermaidTheme').value;

      this.config.title = title;
      this.config.defaultPage = defaultPage;
      this.config.locales = locales;
      this.config.showGallery = showGallery;
      this.config.mermaid.theme = mermaidTheme;

      console.log('📝 Configuration updated:', this.config);
      
      // Mettre à jour le titre de la page
      document.title = this.config.title;
      
      // Régénérer le code HTML
      this.updateGeneratedCode();
      
      // Afficher notification
      this.showNotification('✅ Configuration mise à jour');
    }

    updateGeneratedCode() {
      // Créer une config simplifiée pour l'affichage
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const htmlCode = `&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${configString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

      const codeElement = document.getElementById('generated-html');
      if (codeElement) {
        codeElement.innerHTML = htmlCode;
      }
    }

    downloadConfig() {
      // Utiliser la config simplifiée pour le téléchargement aussi
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2);
      
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.config.title}</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
    <script type="application/json" id="ontowave-config">
${configString}
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('💾 Fichier HTML téléchargé');
    }

    resetConfig() {
      this.config = { ...DEFAULT_CONFIG };
      this.showConfigurationInterface();
      this.showNotification('🔄 Configuration réinitialisée');
    }

    showNotification(message) {
      // Créer une notification temporaire
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = message;
      
      // Ajouter animation CSS
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }

    showError(message) {
      const contentDiv = document.getElementById('ontowave-content');
      if (contentDiv) {
        contentDiv.innerHTML = `<div class="ontowave-error">❌ ${message}</div>`;
      }
    }

    // Panneau de configuration dans le menu flottant
    toggleConfigurationPanel(event, locale = null) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      const targetLang = locale || this.getCurrentLanguage();
      console.log('⚙️ Opening config panel with locale:', targetLang);
      
      const menuContent = document.querySelector('.ontowave-menu-content');
      if (!menuContent) {
        console.error('Menu content not found');
        return;
      }

      // Trouver le bouton Configuration
      const configButton = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');

      // Vérifier si le panneau existe déjà
      let configPanel = document.getElementById('ontowave-config-panel');
      
      if (configPanel) {
        // Si le panneau existe, le supprimer (toggle off)
        configPanel.remove();
        if (configButton) {
          configButton.classList.remove('selected');
        }
        
        // Supprimer la classe pour réactiver le zoom au survol
        const floatingMenu = document.getElementById('ontowave-floating-menu');
        if (floatingMenu) {
          floatingMenu.classList.remove('has-config-panel');
        }
        
        // Mettre à jour l'état de déplacement après fermeture du panneau
        if (typeof window.ontowaveUpdateDragState === 'function') {
          window.ontowaveUpdateDragState();
        }
        console.log('Config panel closed');
        return;
      }

      // Marquer le bouton comme sélectionné
      if (configButton) {
        configButton.classList.add('selected');
      }

      // Créer le panneau de configuration
      configPanel = document.createElement('div');
      configPanel.id = 'ontowave-config-panel';
      configPanel.className = 'ontowave-config-panel';
      
      configPanel.innerHTML = `
        <div class="config-panel-content">
          <div class="config-full-panel">
            <h3>🌊 ${this.t('configTitle', targetLang)}</h3>
            
            <!-- Section Général -->
            <div class="config-section">
              <h4>📖 ${this.t('configGeneral', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-title-full">${this.t('configSiteTitle', targetLang)}</label>
                  <input type="text" id="config-title-full" value="${this.config.title}" />
                </div>
                <div class="form-group-full">
                  <label for="config-defaultPage-full">${this.t('configDefaultPage', targetLang)}</label>
                  <input type="text" id="config-defaultPage-full" value="${this.config.defaultPage}" placeholder="index.md" />
                </div>
              </div>
              <div class="form-group-full">
                <label for="config-baseUrl-full">${this.t('configBaseUrl', targetLang)}</label>
                <input type="text" id="config-baseUrl-full" value="${this.config.baseUrl}" placeholder="/" />
              </div>
            </div>

            <!-- Section Langues et Localisation -->
            <div class="config-section">
              <h4>🌍 ${this.t('configLanguages', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-locales-full">${this.t('configSupportedLanguages', targetLang)}</label>
                  <input type="text" id="config-locales-full" value="${this.config.locales.join(', ')}" placeholder="fr-CA, fr, en" />
                  <small>${this.t('configLanguageNote', targetLang)}</small>
                </div>
                <div class="form-group-full">
                  <label for="config-fallbackLocale-full">${this.t('configFallbackLanguage', targetLang)}</label>
                  <select id="config-fallbackLocale-full">
                    <option value="en" ${this.config.fallbackLocale === 'en' ? 'selected' : ''}>English (en)</option>
                    <option value="fr" ${this.config.fallbackLocale === 'fr' ? 'selected' : ''}>Français (fr)</option>
                    <option value="es" ${this.config.fallbackLocale === 'es' ? 'selected' : ''}>Español (es)</option>
                    <option value="de" ${this.config.fallbackLocale === 'de' ? 'selected' : ''}>Deutsch (de)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section Navigation et Interface -->
            <div class="config-section">
              <h4>🧭 ${this.t('configNavigation', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-showGallery-full" ${this.config.showGallery ? 'checked' : ''} />
                    🎨 ${this.t('configShowGallery', targetLang)}
                  </label>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navHome-full" ${this.config.navigation?.showHome !== false ? 'checked' : ''} />
                    🏠 ${this.t('configHomeButton', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navBreadcrumb-full" ${this.config.navigation?.showBreadcrumb !== false ? 'checked' : ''} />
                    📍 ${this.t('configBreadcrumb', targetLang)}
                  </label>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navToc-full" ${this.config.navigation?.showToc !== false ? 'checked' : ''} />
                    📑 ${this.t('configToc', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section Diagrammes Mermaid -->
            <div class="config-section">
              <h4>📊 ${this.t('configMermaid', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-mermaidTheme-full">${this.t('configMermaidTheme', targetLang)}</label>
                  <select id="config-mermaidTheme-full">
                    <option value="default" ${this.config.mermaid?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.mermaid?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="forest" ${this.config.mermaid?.theme === 'forest' ? 'selected' : ''}>Forest (vert)</option>
                    <option value="neutral" ${this.config.mermaid?.theme === 'neutral' ? 'selected' : ''}>Neutral (neutre)</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-mermaidStart-full" ${this.config.mermaid?.startOnLoad !== false ? 'checked' : ''} />
                    🚀 ${this.t('configMermaidAuto', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-mermaidMaxWidth-full" ${this.config.mermaid?.flowchart?.useMaxWidth !== false ? 'checked' : ''} />
                    📐 ${this.t('configMermaidMaxWidth', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section PlantUML -->
            <div class="config-section">
              <h4>🌿 ${this.t('configPlantuml', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-plantumlServer-full">${this.t('configPlantumlServer', targetLang)}</label>
                  <input type="text" id="config-plantumlServer-full" value="${this.config.plantuml?.server || 'https://www.plantuml.com/plantuml'}" />
                </div>
                <div class="form-group-full">
                  <label for="config-plantumlFormat-full">${this.t('configPlantumlFormat', targetLang)}</label>
                  <select id="config-plantumlFormat-full">
                    <option value="svg" ${this.config.plantuml?.format === 'svg' ? 'selected' : ''}>SVG (vectoriel)</option>
                    <option value="png" ${this.config.plantuml?.format === 'png' ? 'selected' : ''}>PNG (bitmap)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section Coloration Syntaxique -->
            <div class="config-section">
              <h4>🎨 ${this.t('configPrism', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-prismTheme-full">${this.t('configPrismTheme', targetLang)}</label>
                  <select id="config-prismTheme-full">
                    <option value="default" ${this.config.prism?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.prism?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="twilight" ${this.config.prism?.theme === 'twilight' ? 'selected' : ''}>Twilight</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-prismAutoload-full" ${this.config.prism?.autoload !== false ? 'checked' : ''} />
                    🔄 ${this.t('configPrismAutoload', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section Interface Utilisateur -->
            <div class="config-section">
              <h4>💻 ${this.t('configUI', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-uiTheme-full">${this.t('configUITheme', targetLang)}</label>
                  <select id="config-uiTheme-full">
                    <option value="default" ${this.config.ui?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.ui?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="auto" ${this.config.ui?.theme === 'auto' ? 'selected' : ''}>Auto (système)</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-uiResponsive-full" ${this.config.ui?.responsive !== false ? 'checked' : ''} />
                    📱 ${this.t('configUIResponsive', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-uiAnimations-full" ${this.config.ui?.animations !== false ? 'checked' : ''} />
                    ✨ ${this.t('configUIAnimations', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions-full">
              <button onclick="window.OntoWave.instance.updateConfigFromFullPanel()" class="btn-primary">✅ ${this.t('configApply', targetLang)}</button>
              <button onclick="window.OntoWave.instance.downloadConfigFromPanel()" class="btn-secondary">💾 ${this.t('configDownloadHTML', targetLang)}</button>
              <button onclick="window.OntoWave.instance.downloadOntoWaveScript()" class="btn-secondary">📥 ${this.t('configDownloadJS', targetLang)}</button>
              <button onclick="window.OntoWave.instance.resetConfigToDefaults()" class="btn-warning">🔄 ${this.t('configReset', targetLang)}</button>
            </div>
          </div>
        </div>
      `;

      // Ajouter les styles du panneau
      this.addConfigPanelStyles();
      
      // Insérer le panneau après le menu
      menuContent.appendChild(configPanel);
      
      // Ajouter la classe pour désactiver le zoom au survol
      const floatingMenu = document.getElementById('ontowave-floating-menu');
      if (floatingMenu) {
        floatingMenu.classList.add('has-config-panel');
      }
      
      // Mettre à jour l'état de déplacement après ouverture du panneau
      if (typeof window.ontowaveUpdateDragState === 'function') {
        window.ontowaveUpdateDragState();
      }
      
      // Générer le code HTML initial
      this.updateGeneratedCodeMini();
      
      console.log('Config panel opened');
    }

    // Méthodes pour le panneau complet
    updateConfigFromFullPanel() {
      // Général
      const title = document.getElementById('config-title-full')?.value || this.config.title;
      const defaultPage = document.getElementById('config-defaultPage-full')?.value || this.config.defaultPage;
      const baseUrl = document.getElementById('config-baseUrl-full')?.value || this.config.baseUrl;

      // Langues
      const locales = document.getElementById('config-locales-full')?.value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0) || this.config.locales;
      const fallbackLocale = document.getElementById('config-fallbackLocale-full')?.value || this.config.fallbackLocale;

      // Navigation
      const showGallery = document.getElementById('config-showGallery-full')?.checked || false;
      const showHome = document.getElementById('config-navHome-full')?.checked !== false;
      const showBreadcrumb = document.getElementById('config-navBreadcrumb-full')?.checked !== false;
      const showToc = document.getElementById('config-navToc-full')?.checked !== false;

      // Mermaid
      const mermaidTheme = document.getElementById('config-mermaidTheme-full')?.value || 'default';
      const mermaidStart = document.getElementById('config-mermaidStart-full')?.checked !== false;
      const mermaidMaxWidth = document.getElementById('config-mermaidMaxWidth-full')?.checked !== false;

      // PlantUML
      const plantumlServer = document.getElementById('config-plantumlServer-full')?.value || 'https://www.plantuml.com/plantuml';
      const plantumlFormat = document.getElementById('config-plantumlFormat-full')?.value || 'svg';

      // Prism
      const prismTheme = document.getElementById('config-prismTheme-full')?.value || 'default';
      const prismAutoload = document.getElementById('config-prismAutoload-full')?.checked !== false;

      // UI
      const uiTheme = document.getElementById('config-uiTheme-full')?.value || 'default';
      const uiResponsive = document.getElementById('config-uiResponsive-full')?.checked !== false;
      const uiAnimations = document.getElementById('config-uiAnimations-full')?.checked !== false;

      // Mettre à jour la configuration
      this.config.title = title;
      this.config.defaultPage = defaultPage;
      this.config.baseUrl = baseUrl;
      this.config.locales = locales;
      this.config.fallbackLocale = fallbackLocale;
      this.config.showGallery = showGallery;
      
      this.config.navigation = {
        showHome: showHome,
        showBreadcrumb: showBreadcrumb,
        showToc: showToc
      };

      this.config.mermaid = {
        theme: mermaidTheme,
        startOnLoad: mermaidStart,
        flowchart: { useMaxWidth: mermaidMaxWidth },
        sequence: { useMaxWidth: mermaidMaxWidth },
        gantt: { useMaxWidth: mermaidMaxWidth },
        journey: { useMaxWidth: mermaidMaxWidth }
      };

      this.config.plantuml = {
        server: plantumlServer,
        format: plantumlFormat
      };

      this.config.prism = {
        theme: prismTheme,
        autoload: prismAutoload
      };

      this.config.ui = {
        theme: uiTheme,
        responsive: uiResponsive,
        animations: uiAnimations
      };

      // Mettre à jour le titre de la page
      document.title = this.config.title;

      // Afficher une notification
      this.showNotification('Configuration appliquée avec succès ! 🎉');

      console.log('Configuration mise à jour:', this.config);
    }

    resetConfigToDefaults() {
      if (confirm('Voulez-vous vraiment réinitialiser toute la configuration aux valeurs par défaut ?')) {
        // Réinitialiser avec les valeurs par défaut
        Object.assign(this.config, {
          title: "OntoWave Documentation",
          baseUrl: "/",
          defaultPage: "index.md",
          locales: [],
          fallbackLocale: "en",
          showGallery: false,
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
        });

        // Fermer et rouvrir le panneau pour actualiser les valeurs
        const configPanel = document.getElementById('ontowave-config-panel');
        if (configPanel) {
          configPanel.remove();
          // Mettre à jour l'état de déplacement après suppression du panneau
          if (typeof window.ontowaveUpdateDragState === 'function') {
            window.ontowaveUpdateDragState();
          }
          setTimeout(() => this.toggleConfigurationPanel(), 100);
        }

        this.showNotification('Configuration réinitialisée ! 🔄');
      }
    }

    // Méthodes pour le panneau compact (compatibilité)
    updateConfigFromPanel() {
      const title = document.getElementById('config-title-mini')?.value || this.config.title;
      const locales = document.getElementById('config-locales-mini')?.value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0) || this.config.locales;
      const showGallery = document.getElementById('config-showGallery-mini')?.checked || this.config.showGallery;

      this.config.title = title;
      this.config.locales = locales;
      this.config.showGallery = showGallery;

      // Mettre à jour le titre de la page
      document.title = this.config.title;
      
      // Régénérer le code HTML
      this.updateGeneratedCodeMini();
      
      this.showNotification('✅ Configuration mise à jour');
    }

    downloadConfigFromPanel() {
      // Utiliser la config simplifiée pour le téléchargement
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2);
      
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.config.title}</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
    <script type="application/json" id="ontowave-config">
${configString}
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('💾 Fichier HTML téléchargé');
    }

    downloadOntoWaveScript() {
      // Créer un lien de téléchargement vers le fichier ontowave.min.js
      const a = document.createElement('a');
      a.href = 'ontowave.min.js';
      a.download = 'ontowave.min.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      this.showNotification('📥 Fichier ontowave.min.js téléchargé');
    }

    updateGeneratedCodeMini() {
      // Créer une config simplifiée pour l'affichage
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const htmlCode = `&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${configString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

      const codeElement = document.getElementById('generated-html-mini');
      if (codeElement) {
        codeElement.innerHTML = htmlCode;
      }
    }

    addConfigPanelStyles() {
      if (document.getElementById('ontowave-config-panel-styles')) return;

      const style = document.createElement('style');
      style.id = 'ontowave-config-panel-styles';
      style.textContent = `
        /* Panneau de configuration étendu */
        .ontowave-config-panel {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 12px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.15);
          z-index: 1001;
          margin-top: 12px;
          max-height: 90vh;
          overflow-y: auto;
          min-width: 90vw;
          max-width: 95vw;
          width: auto;
        }
        
        .config-panel-content {
          padding: 0;
        }
        
        .config-full-panel {
          padding: 32px;
          max-width: none;
        }
        
        .config-full-panel h3 {
          margin: 0 0 32px 0;
          color: #0969da;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #f6f8fa;
        }
        
        /* Sections de configuration */
        .config-section {
          margin-bottom: 32px;
          padding: 24px;
          background: #f6f8fa;
          border-radius: 8px;
          border-left: 4px solid #0969da;
        }
        
        .config-section h4 {
          margin: 0 0 20px 0;
          color: #24292e;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Disposition en lignes */
        .config-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }
        
        .config-row:last-child {
          margin-bottom: 0;
        }
        
        /* Groupes de formulaire */
        .form-group-full {
          margin-bottom: 0;
        }
        
        .form-group-full label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #24292e;
          font-size: 14px;
        }
        
        .form-group-full input,
        .form-group-full select {
          width: 100%;
          padding: 12px;
          border: 2px solid #d0d7de;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        
        .form-group-full input:focus,
        .form-group-full select:focus {
          outline: none;
          border-color: #0969da;
          box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
        }
        
        .form-group-full small {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #656d76;
          font-style: italic;
        }
        
        /* Checkboxes */
        .form-group-checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 0;
        }
        
        .form-group-checkbox label {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #24292e;
          font-size: 14px;
          cursor: pointer;
          margin: 0;
        }
        
        .form-group-checkbox input[type="checkbox"] {
          width: auto;
          margin: 0 8px 0 0;
          transform: scale(1.2);
          accent-color: #0969da;
        }
        
        /* Actions du formulaire */
        .form-actions-full {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 2px solid #f6f8fa;
          flex-wrap: wrap;
        }
        
        .form-actions-full button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: #0969da;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0550ae;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(9, 105, 218, 0.3);
        }
        
        .btn-secondary {
          background: #6f7782;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #57606a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(111, 119, 130, 0.3);
        }
        
        .btn-warning {
          background: #d73a49;
          color: white;
        }
        
        .btn-warning:hover {
          background: #b31d28;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(215, 58, 73, 0.3);
        }
        
        /* Responsive pour petits écrans */
        @media (max-width: 768px) {
          .ontowave-config-panel {
            min-width: 95vw;
            margin-top: 8px;
          }
          
          .config-full-panel {
            padding: 20px;
          }
          
          .config-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .form-actions-full {
            flex-direction: column;
            align-items: stretch;
          }
          
          .form-actions-full button {
            min-width: auto;
          }
        }
        
        /* Styles pour compatibilité avec l'ancien panneau compact */
        .config-form-compact h3,
        .config-preview-compact h3 {
          margin: 0 0 16px 0;
          color: #0969da;
          font-size: 16px;
          font-weight: 600;
        }
        
        .form-group-compact {
          margin-bottom: 16px;
        }
        
        .form-group-compact label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #24292e;
          font-size: 13px;
        }
        
        .form-group-compact input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d0d7de;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .form-group-compact input[type="checkbox"] {
          width: auto;
          margin-right: 6px;
        }
        
        .form-actions-compact {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .form-actions-compact button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          background: #0969da;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          min-width: 120px;
        }
        
        .form-actions-compact button:hover {
          background: #0550ae;
        }
        
        .config-preview-compact {
          background: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
        }
        
        .code-preview-mini {
          background: #24292e;
          color: #f6f8fa;
          padding: 12px;
          border-radius: 4px;
          font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 11px;
          line-height: 1.4;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
      `;
      document.head.appendChild(style);
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

  // Fonction pour charger la configuration depuis config.json
  async function loadConfigFromFile() {
    try {
      const response = await fetch('./config.json');
      if (response.ok) {
        const config = await response.json();
        console.log('📁 Configuration chargée depuis config.json:', config);
        return config;
      }
    } catch (error) {
      console.log('📁 Pas de config.json trouvé, utilisation de la configuration par défaut');
    }
    return {};
  }

  // Initialisation automatique au chargement de la page
  document.addEventListener('DOMContentLoaded', async () => {
    // Utiliser window.OntoWaveConfig si disponible, sinon charger depuis config.json
    let config = window.OntoWaveConfig || {};
    if (!window.OntoWaveConfig) {
      config = await loadConfigFromFile();
    } else {
      // Merger avec config.json si les deux existent
      const fileConfig = await loadConfigFromFile();
      config = { ...fileConfig, ...window.OntoWaveConfig };
    }
    
    window.OntoWave = { instance: new OntoWave(config) };
    await window.OntoWave.instance.init();
    console.log('🌊 OntoWave initialisé automatiquement');
  });

  // Export pour utilisation manuelle si nécessaire
  window.OntoWaveClass = OntoWave;

})(window);
