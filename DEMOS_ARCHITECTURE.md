# 🎯 Architecture Démos OntoWave v1.0.9

> **Objectif Dual**: Showcase fonctionnalités + Tests de régression automatisés

## 📊 Inventaire Capacités OntoWave v1.0.9

### 🔹 Core Features (sans configuration)

#### 1. **Markdown Rendering**
- Headings (H1-H6) avec auto-ID pour ancres
- Paragraphes, **bold**, *italic*, ~~strikethrough~~
- Listes ordonnées et non-ordonnées
- Liens `[text](url)` avec navigation SPA
- Images `![alt](url)`
- Blockquotes `>`
- Code inline `` `code` ``
- Tableaux avec alignements `:---`, `:---:`, `---:`

#### 2. **Diagrammes Mermaid** 
- Flowcharts, pie charts, gantt
- Sequence diagrams
- Class diagrams
- State diagrams
- SVG inline direct (pas d'iframe)

#### 3. **Diagrammes PlantUML**
- Blocs Markdown ` ```plantuml ` → Kroki API → SVG inline
- Fichiers `.puml` direct loadables
- Support autres formats Kroki: `dot`, `d2`, `bpmn`, etc.

#### 4. **Routing SPA**
- Hash-based routing `#/path/to/page`
- Paramètres query `?view=split&lang=fr`
- 404 automatique si fichier manquant

#### 5. **TOC Automatique**
- Extraction H1-H3 avec `id`
- Génération liens cliquables
- Sidebar optionnelle

### ⚙️ Advanced Features (via configuration)

#### 6. **Modes d'Affichage** (`?view=mode`)
- `?view=split` : Source MD ← → Rendu HTML côte à côte
- `?view=md` : Source Markdown seule
- Par défaut : Rendu HTML seul

#### 7. **Internationalisation (i18n)**
```javascript
window.ontoWaveConfig = {
  i18n: {
    default: "fr",
    supported: ["fr", "en", "es"]
  }
}
```
- Détection automatique langue navigateur
- Fallback vers langue par défaut
- Routing multilingue `/fr/page`, `/en/page`

#### 8. **Configuration UI**
```javascript
ui: {
  header: true,    // Bandeau supérieur
  sidebar: true,   // TOC latérale
  toc: true,       // Table des matières
  footer: true,    // Pied de page
  minimal: false,  // Mode minimal (désactive tout)
  menu: true       // Menu flottant 🌊
}
```

#### 9. **Multi-Roots** (submodules)
```javascript
roots: [
  { base: "/", root: "/docs/" },
  { base: "/fr", root: "/docs/fr/" },
  { base: "/vendor", root: "/vendor-module/" }
]
```
- Délégation via `_delegate.json` ou `CNAME`
- Redirection automatique vers sites externes

#### 10. **Search** (recherche textuelle)
- Index automatique des contenus
- Recherche full-text dans pages
- Highlighting résultats

## 🏗️ Structure Démos Proposée

```
docs/                          # ⚠️ ROOT PUBLIC (GitHub Pages)
├── index.html                 # Page d'accueil OntoWave.org
├── index.fr.md                # Documentation FR
├── index.en.md                # Documentation EN
├── demos/
│   ├── index.html             # 📋 Catalogue interactif des démos
│   ├── index.md               # Description démos
│   │
│   ├── 01-base/               # ✨ Capacités par défaut (sans config)
│   │   ├── markdown.html      # Tables, listes, headings, links
│   │   ├── markdown.md
│   │   ├── mermaid.html       # Flowcharts, sequence, class
│   │   ├── mermaid.md
│   │   ├── plantuml.html      # Diagrammes UML via Kroki
│   │   ├── plantuml.md
│   │   └── routing.html       # Navigation SPA, hash, 404
│   │
│   ├── 02-config/             # ⚙️ Configurations avancées
│   │   ├── i18n.html          # Détection langue + fallback
│   │   ├── i18n.fr.md
│   │   ├── i18n.en.md
│   │   ├── view-modes.html    # split, md, normal
│   │   ├── view-modes.md
│   │   ├── ui-custom.html     # sidebar, header, minimal
│   │   └── ui-custom.md
│   │
│   └── (legacy demos conservés pour compatibilité)
│
└── assets/                    # Build artifacts (auto-généré)

IMPORTANT: Le serveur DOIT TOUJOURS servir docs/ (pas la racine projet)
- GitHub Pages: sert docs/ automatiquement
- Tests E2E: python3 -m http.server 8080 --directory docs
- URLs: /demos/01-base/markdown.html (pas /docs/demos/...)
```

## 🧪 Framework Test-Driven: Playwright + Visual Regression

### Stack Technique
```json
{
  "framework": "Playwright",
  "visual-regression": "pixelmatch (built-in Playwright)",
  "console-tracking": "page.on('console')",
  "coverage": "Tous les scénarios = 1 démo + 1 spec"
}
```

### Template Spec Playwright

```javascript
// tests/e2e/demos/01-base-markdown.spec.js
import { test, expect } from '@playwright/test';

test.describe('Demo 01-base: Markdown Features', () => {
  test.beforeEach(async ({ page }) => {
    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  test('should render markdown with tables', async ({ page }) => {
    await page.goto('http://localhost:8080/docs/demos/01-base/markdown.html');
    
    // Wait for content loaded
    await page.waitForSelector('h1');
    
    // Check H1 présent
    const h1 = await page.textContent('h1');
    expect(h1).toContain('Markdown Features');
    
    // Check table rendered
    const tables = await page.locator('table').count();
    expect(tables).toBeGreaterThan(0);
    
    // Check table alignment CSS
    const alignedCell = page.locator('td[style*="text-align: center"]');
    await expect(alignedCell).toBeVisible();
    
    // Screenshot baseline
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/01-base-markdown.png',
      fullPage: true 
    });
    
    // Visual regression comparison
    await expect(page).toHaveScreenshot('01-base-markdown.png', {
      maxDiffPixels: 100  // Tolérance 100 pixels
    });
  });

  test('should have clickable navigation links', async ({ page }) => {
    await page.goto('http://localhost:8080/docs/demos/01-base/markdown.html');
    
    // Click on internal link
    await page.click('a[href*="#section-2"]');
    
    // Check hash changed
    expect(page.url()).toContain('#section-2');
  });
});
```

### Configuration Playwright

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e/demos',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox et WebKit optionnels pour CI
  ],

  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📝 Génération Automatique Démos

### Script générateur `tools/generate-demos.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEMOS_BASE = path.join(__dirname, '../docs/demos');

const demos = [
  {
    category: '01-base',
    name: 'markdown',
    title: 'Markdown Features',
    description: 'Tables, lists, headings, links, images',
    content: `# Markdown Features

## Tables with Alignment

| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |

## Lists

- Item 1
- Item 2
  - Nested

## Code

\`\`\`javascript
console.log('Hello OntoWave');
\`\`\`
`
  },
  {
    category: '01-base',
    name: 'mermaid',
    title: 'Mermaid Diagrams',
    description: 'Flowcharts, sequence, class diagrams',
    content: `# Mermaid Diagrams

## Flowchart

\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[End]
\`\`\`
`
  }
  // ... autres démos
];

demos.forEach(demo => {
  const dir = path.join(DEMOS_BASE, demo.category);
  fs.mkdirSync(dir, { recursive: true });
  
  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${demo.title} - OntoWave Demo</title>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
  <script>
    window.ontoWaveConfig = {
      roots: [{ base: "/", root: "/docs/demos/${demo.category}/" }]
    };
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(dir, `${demo.name}.html`), html);
  
  // Generate MD
  fs.writeFileSync(path.join(dir, `${demo.name}.md`), demo.content);
  
  console.log(`✅ Generated ${demo.category}/${demo.name}`);
});
```

## 🎬 Workflow Test-Driven

### 1. **BDD-Style avec Given-When-Then**

```javascript
test('i18n auto-detection', async ({ page }) => {
  // GIVEN: Browser language is English
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', {
      get: () => 'en-US'
    });
  });
  
  // WHEN: Page loads with i18n config
  await page.goto('/docs/demos/02-config/i18n.html');
  
  // THEN: English content is displayed
  const content = await page.textContent('body');
  expect(content).toContain('Welcome'); // Not "Bienvenue"
});
```

### 2. **Property-Based Testing** (optionnel)

```javascript
import fc from 'fast-check';

test.describe('Markdown fuzzing', () => {
  test('should handle arbitrary markdown safely', async ({ page }) => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (markdown) => {
        // Inject markdown via data URI
        const encoded = encodeURIComponent(markdown);
        await page.goto(`data:text/html,<script src="ontowave.js"></script><script>window.ontoWaveConfig={roots:[{base:"/",root:"data:text/markdown,${encoded}"}]}</script>`);
        
        // Should not crash or show XSS
        const errors = [];
        page.on('pageerror', err => errors.push(err));
        await page.waitForTimeout(1000);
        expect(errors).toHaveLength(0);
      })
    );
  });
});
```

## 🚀 Commandes

```bash
# Générer toutes les démos
node tools/generate-demos.js

# Créer baselines screenshots
npx playwright test --update-snapshots

# Run tests avec rapport HTML
npx playwright test --reporter=html

# Run tests en mode watch
npx playwright test --ui

# Tests specific category
npx playwright test tests/e2e/demos/01-base

# CI mode
CI=true npx playwright test --reporter=json
```

## 📊 Métriques de Couverture

```json
{
  "demos": 12,
  "specs": 12,
  "assertions": 48,
  "screenshots": 12,
  "features_tested": {
    "markdown": ["tables", "lists", "headings", "links"],
    "diagrams": ["mermaid", "plantuml", "svg-inline"],
    "routing": ["hash", "spa", "404"],
    "i18n": ["detection", "fallback", "routing"],
    "ui": ["sidebar", "toc", "minimal", "menu"],
    "view_modes": ["split", "md", "normal"]
  }
}
```

## ✅ Critères de Succès

### Démo valide si:
1. ✅ 0 erreur console
2. ✅ Contenu principal visible (H1 détecté)
3. ✅ Diagrammes rendus (si applicable)
4. ✅ Navigation fonctionnelle
5. ✅ Screenshot diff < 100 pixels vs baseline
6. ✅ Temps de chargement < 3s

### Régression détectée si:
- ❌ Console error nouveau
- ❌ Screenshot diff > 100 pixels
- ❌ Test timeout (> 30s)
- ❌ Element attendu manquant

---

**Prochaines étapes:**
1. Générer démos via script
2. Créer specs Playwright miroirs
3. Établir baselines screenshots
4. Documenter dans index.fr.md/index.en.md
5. Ajouter badge CI au README
