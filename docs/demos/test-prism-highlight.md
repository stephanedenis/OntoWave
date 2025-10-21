# 🎨 Démo Prism.js - Coloration Syntaxique

## 🎯 Pourquoi cette fonctionnalité est utile

La coloration syntaxique avec Prism.js transforme du code brut en code lisible et professionnel :

- **Lisibilité** : Couleurs pour mots-clés, variables, strings
- **Documentation technique** : Exemples de code clairs
- **Tutoriels** : Code facile à comprendre pour les lecteurs
- **Support multi-langages** : Python, JavaScript, TypeScript, Bash, JSON, YAML, etc.

## 📋 Ce que vous allez voir dans cette démo

1. **Python** - Code avec classes et fonctions
2. **JavaScript** - Code ES6+ moderne
3. **TypeScript** - Interfaces et types
4. **Bash** - Scripts shell
5. **JSON** - Configuration
6. **YAML** - Config Docker/K8s
7. **CSS** - Styles
8. **HTML** - Markup

---

## 1. Python - API REST avec FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="OntoWave API")

class Page(BaseModel):
    """Modèle de page OntoWave"""
    path: str
    content: str
    language: Optional[str] = "fr"
    has_diagrams: bool = False

# Base de données simulée
pages_db: List[Page] = []

@app.get("/pages", response_model=List[Page])
async def get_pages():
    """Récupère toutes les pages"""
    return pages_db

@app.post("/pages", response_model=Page)
async def create_page(page: Page):
    """Crée une nouvelle page"""
    pages_db.append(page)
    return page

@app.get("/pages/{page_path}")
async def get_page(page_path: str):
    """Récupère une page spécifique"""
    for page in pages_db:
        if page.path == page_path:
            return page
    raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Ce code montre** : API REST complète avec types Python, décorateurs, async/await.

---

## 2. JavaScript - Classe OntoWave Simplifiée

```javascript
class OntoWave {
  constructor(config = {}) {
    this.config = {
      basePath: config.basePath || '',
      contentPath: config.contentPath || 'index.md',
      languages: config.languages || { supported: 'fr,en', default: 'fr' },
      ...config
    };
    
    this.container = null;
    this.currentPage = null;
    
    this.init();
  }
  
  async init() {
    console.log('🌊 OntoWave v1.0.1 initializing...');
    this.createInterface();
    await this.loadInitialPage();
  }
  
  async loadPage(pagePath) {
    try {
      const response = await fetch(`${this.config.basePath}${pagePath}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      const html = await this.renderMarkdown(content);
      
      document.getElementById('ontowave-content').innerHTML = html;
      
      await this.processDiagrams();
      await this.processPrism();
      
    } catch (error) {
      console.error('❌ Failed to load page:', error);
      this.showError(error.message);
    }
  }
  
  renderMarkdown(content) {
    // Parsing markdown simplifié
    let html = content
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    return html;
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const ontowave = new OntoWave({
    basePath: './',
    contentPath: 'docs/index.md'
  });
  
  window.OntoWave = { instance: ontowave };
});
```

**Ce code montre** : Architecture classe JavaScript avec async/await, fetch API, template literals.

---

## 3. TypeScript - Interfaces et Types

```typescript
interface OntoWaveConfig {
  basePath?: string;
  contentPath?: string;
  languages?: LanguageConfig;
  mermaid?: MermaidConfig;
  plantuml?: PlantUMLConfig;
  prism?: PrismConfig;
}

interface LanguageConfig {
  supported: string;
  default: string;
}

interface MermaidConfig {
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
  startOnLoad?: boolean;
}

interface PlantUMLConfig {
  server: string;
  format: 'svg' | 'png';
}

interface PrismConfig {
  theme?: string;
  autoload?: boolean;
}

type PagePath = string;
type MarkdownContent = string;
type HTMLContent = string;

class OntoWave {
  private config: Required<OntoWaveConfig>;
  private container: HTMLElement | null = null;
  private currentPage: PagePath | null = null;
  
  constructor(config: OntoWaveConfig) {
    this.config = this.mergeConfig(config);
  }
  
  private mergeConfig(config: OntoWaveConfig): Required<OntoWaveConfig> {
    return {
      basePath: config.basePath ?? '',
      contentPath: config.contentPath ?? 'index.md',
      languages: config.languages ?? { supported: 'fr,en', default: 'fr' },
      mermaid: config.mermaid ?? { theme: 'default', startOnLoad: true },
      plantuml: config.plantuml ?? { 
        server: 'https://www.plantuml.com/plantuml', 
        format: 'svg' 
      },
      prism: config.prism ?? { theme: 'default', autoload: true }
    };
  }
  
  async loadPage(pagePath: PagePath): Promise<void> {
    const content: MarkdownContent = await this.fetchContent(pagePath);
    const html: HTMLContent = await this.renderMarkdown(content);
    this.displayContent(html);
  }
  
  private async fetchContent(path: PagePath): Promise<MarkdownContent> {
    const response = await fetch(`${this.config.basePath}${path}`);
    return response.text();
  }
  
  private async renderMarkdown(content: MarkdownContent): Promise<HTMLContent> {
    // Implémentation...
    return '<div></div>';
  }
  
  private displayContent(html: HTMLContent): void {
    if (this.container) {
      this.container.innerHTML = html;
    }
  }
}

export { OntoWave, OntoWaveConfig, PagePath, MarkdownContent, HTMLContent };
```

**Ce code montre** : Types TypeScript stricts, interfaces, génériques, visibilité private/public.

---

## 4. Bash - Script Déploiement

```bash
#!/bin/bash

# Script de déploiement OntoWave
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêt immédiat si erreur

ENV=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="dist"
DEPLOY_DIR="docs"

echo "🚀 Déploiement OntoWave - Environnement: $ENV"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérification prérequis
command -v node >/dev/null 2>&1 || { 
  echo "❌ Node.js n'est pas installé"; exit 1; 
}

command -v uglifyjs >/dev/null 2>&1 || { 
  echo "❌ UglifyJS n'est pas installé"; exit 1; 
}

# Build
echo "📦 Build du bundle..."
npm run build:package

if [ $? -eq 0 ]; then
  echo "✅ Build réussi"
else
  echo "❌ Échec du build"
  exit 1
fi

# Vérification taille bundle
BUNDLE_SIZE=$(stat -f%z "$BUILD_DIR/ontowave.min.js" 2>/dev/null || stat -c%s "$BUILD_DIR/ontowave.min.js")
MAX_SIZE=$((80 * 1024))  # 80KB

if [ "$BUNDLE_SIZE" -gt "$MAX_SIZE" ]; then
  echo "⚠️  Warning: Bundle size ${BUNDLE_SIZE}B > ${MAX_SIZE}B"
else
  echo "✅ Bundle size OK: ${BUNDLE_SIZE}B"
fi

# Backup
echo "💾 Backup ancien bundle..."
if [ -f "$DEPLOY_DIR/ontowave.min.js" ]; then
  cp "$DEPLOY_DIR/ontowave.min.js" "$DEPLOY_DIR/backups/ontowave_${TIMESTAMP}.min.js"
fi

# Déploiement
echo "📤 Copie bundle vers $DEPLOY_DIR..."
cp "$BUILD_DIR/ontowave.min.js" "$DEPLOY_DIR/"
cp "$BUILD_DIR/ontowave.js" "$DEPLOY_DIR/"

# Git commit (si production)
if [ "$ENV" == "production" ]; then
  echo "📝 Commit Git..."
  git add "$DEPLOY_DIR/ontowave*.js"
  git commit -m "chore: deploy OntoWave v1.0.1 - ${TIMESTAMP}"
  git push origin main
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Déploiement terminé avec succès!"
```

**Ce code montre** : Script Bash avec variables, conditions, error handling, commandes système.

---

## 5. JSON - Configuration OntoWave

```json
{
  "title": "OntoWave Documentation",
  "version": "1.0.1",
  "baseUrl": "/",
  "defaultPage": "index.md",
  "languages": {
    "supported": ["fr", "en"],
    "default": "fr"
  },
  "mermaid": {
    "theme": "default",
    "startOnLoad": true,
    "themeVariables": {
      "primaryColor": "#4a90e2",
      "primaryTextColor": "#fff",
      "lineColor": "#333"
    }
  },
  "plantuml": {
    "server": "https://www.plantuml.com/plantuml",
    "format": "svg",
    "encoding": "deflate"
  },
  "prism": {
    "theme": "tomorrow",
    "autoload": true,
    "languages": [
      "javascript",
      "typescript",
      "python",
      "bash",
      "json",
      "yaml",
      "markdown"
    ]
  },
  "navigation": {
    "showBreadcrumb": true,
    "showHome": true,
    "showToc": true
  },
  "ui": {
    "theme": "light",
    "responsive": true,
    "animations": true,
    "languageButtons": "menu"
  }
}
```

**Ce code montre** : Structure JSON valide avec objets imbriqués, arrays, booleans.

---

## 6. YAML - Docker Compose

```yaml
version: '3.8'

services:
  ontowave-web:
    image: nginx:alpine
    container_name: ontowave_web
    ports:
      - "8080:80"
    volumes:
      - ./docs:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
    restart: unless-stopped
    networks:
      - ontowave_network
    labels:
      - "com.ontowave.version=1.0.1"
      - "com.ontowave.description=OntoWave Documentation Server"
  
  ontowave-plantuml:
    image: plantuml/plantuml-server:jetty
    container_name: ontowave_plantuml
    ports:
      - "8081:8080"
    environment:
      - BASE_URL=plantuml
    restart: unless-stopped
    networks:
      - ontowave_network

networks:
  ontowave_network:
    driver: bridge

volumes:
  ontowave_data:
    driver: local
```

**Ce code montre** : YAML Docker Compose avec services, volumes, networks, labels.

---

## 7. CSS - Styles OntoWave

```css
/* Variables CSS */
:root {
  --primary-color: #4a90e2;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --border-color: #d0d7de;
  --code-bg: #f6f8fa;
  --transition-speed: 0.3s;
}

/* Conteneur principal */
.ontowave-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
               Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
}

/* Tableaux avec hover */
.ontowave-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow var(--transition-speed);
}

.ontowave-table:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ontowave-table th {
  background: linear-gradient(135deg, var(--primary-color), #357abd);
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

.ontowave-table tr:nth-child(even) {
  background-color: var(--secondary-color);
}

.ontowave-table tr:hover {
  background-color: #e8f4fd;
  transition: background-color var(--transition-speed);
}

/* Blocs de code */
pre[class*="language-"] {
  background: var(--code-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ontowave-content > * {
  animation: slideIn 0.5s ease-out;
}

/* Media queries responsive */
@media (max-width: 768px) {
  .ontowave-content {
    padding: 1rem;
  }
  
  .ontowave-table {
    font-size: 0.9rem;
  }
  
  pre[class*="language-"] {
    font-size: 0.85rem;
  }
}
```

**Ce code montre** : Variables CSS, gradients, animations, media queries, pseudo-classes.

---

## 8. HTML - Structure Page OntoWave

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="OntoWave - Documentation interactive légère">
  <meta name="keywords" content="markdown, documentation, diagrams, mermaid, plantuml">
  <meta name="author" content="Stéphane Denis">
  
  <title>OntoWave v1.0.1 - Documentation Interactive</title>
  
  <!-- Favicon -->
  <link rel="icon" href="favicon.ico" type="image/x-icon">
  
  <!-- OntoWave Bundle -->
  <script src="ontowave.min.js"></script>
  
  <!-- SEO -->
  <meta property="og:title" content="OntoWave Documentation">
  <meta property="og:description" content="Lightweight interactive documentation">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ontowave.org">
</head>
<body>
  <!-- Conteneur OntoWave -->
  <div id="ontowave"></div>
  
  <!-- Configuration -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      new OntoWave({
        basePath: './',
        contentPath: 'index.md',
        languages: {
          supported: 'fr,en',
          default: 'fr'
        }
      });
    });
  </script>
  
  <!-- Analytics (optionnel) -->
  <script>
    // Google Analytics, Plausible, ou autre
    console.log('📊 Analytics initialized');
  </script>
</body>
</html>
```

**Ce code montre** : Structure HTML5 sémantique, meta tags, SEO, Open Graph.

---


## 📚 Langages Supportés

OntoWave + Prism.js supporte **150+ langages** dont :

**Backend** : Python, PHP, Ruby, Java, C#, Go, Rust  
**Frontend** : JavaScript, TypeScript, HTML, CSS, SCSS  
**Data** : JSON, YAML, TOML, XML  
**Shell** : Bash, PowerShell, Zsh  
**Markup** : Markdown, LaTeX  
**Database** : SQL, GraphQL  
**Config** : Nginx, Apache, Docker

---

**🔗 Retour** : [← Index démos](index.md)
