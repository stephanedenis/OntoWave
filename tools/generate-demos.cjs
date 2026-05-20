#!/usr/bin/env node
/**
 * Générateur automatique de démos OntoWave
 * Crée structure HTML + MD + specs Playwright
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const DEMOS_DIR = path.join(DOCS_DIR, 'demos');
const SPECS_DIR = path.join(__dirname, '../tests/e2e/demos');

// Définition des démos
const DEMO_CATALOG = [
  // === 01-base: Capacités par défaut (sans config) ===
  {
    category: '01-base',
    id: 'markdown',
    title: 'Markdown Features',
    description: 'Tables with alignment, lists, headings, links, images',
    content: `# Markdown Features

## Tables with Alignment

OntoWave supports full Markdown table syntax with column alignments:

| Feature | Left-aligned | Center-aligned | Right-aligned |
|:--------|:------------:|:--------------|-------------:|
| Tables  | Yes          | ✅             | 100%         |
| Lists   | Yes          | ✅             | 100%         |
| Links   | Yes          | ✅             | 100%         |

### Alignment Syntax

- Left: \`:---\`
- Center: \`:---:\`
- Right: \`---:\`

## Lists

### Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered Lists
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

## Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Links

- External link: [OntoWave on npm](https://www.npmjs.com/package/ontowave)
- Internal link: [Back to top](#markdown-features)
- Relative link: [See Mermaid demo](mermaid.html)

## Images

![OntoWave Logo](https://via.placeholder.com/150?text=OntoWave)

## Text Formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`Inline code\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Code Blocks

\`\`\`javascript
// JavaScript code example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('OntoWave'));
\`\`\`
`,
    config: null  // Pas de config = capacités par défaut
  },

  {
    category: '01-base',
    id: 'mermaid',
    title: 'Mermaid Diagrams',
    description: 'Flowcharts, sequence diagrams, class diagrams rendered as inline SVG',
    content: `# Mermaid Diagrams

OntoWave renders Mermaid diagrams directly as inline SVG without iframes.

## Flowchart

\`\`\`mermaid
graph TD
    A[Start OntoWave] --> B{Load Config?}
    B -->|Yes| C[Load config.json]
    B -->|No| D[Use defaults]
    C --> E[Parse Markdown]
    D --> E
    E --> F[Render HTML]
    F --> G[Apply Enhancements]
    G --> H{Has Mermaid?}
    H -->|Yes| I[Render Mermaid SVG]
    H -->|No| J[Done]
    I --> J
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant OntoWave
    participant Server
    
    User->>Browser: Navigate to page
    Browser->>OntoWave: Load ontowave.min.js
    OntoWave->>OntoWave: Read config
    OntoWave->>Server: Fetch markdown
    Server-->>OntoWave: Return .md file
    OntoWave->>OntoWave: Parse markdown
    OntoWave->>OntoWave: Render Mermaid
    OntoWave->>Browser: Inject HTML + SVG
    Browser-->>User: Display page
\`\`\`

## Class Diagram

\`\`\`mermaid
classDiagram
    class OntoWave {
        +config: AppConfig
        +router: RouterService
        +markdown: MarkdownRenderer
        +start()
        +renderRoute()
    }
    
    class RouterService {
        +get(): Route
        +subscribe(callback)
        +navigate(path)
    }
    
    class MarkdownRenderer {
        +render(mdSrc): string
    }
    
    OntoWave --> RouterService
    OntoWave --> MarkdownRenderer
\`\`\`

## Pie Chart

\`\`\`mermaid
pie title OntoWave Bundle Composition
    "Core Router" : 25
    "Markdown Parser" : 30
    "Mermaid Support" : 20
    "PlantUML/Kroki" : 15
    "i18n System" : 10
\`\`\`
`,
    config: null
  },

  {
    category: '01-base',
    id: 'plantuml',
    title: 'PlantUML via Kroki',
    description: 'UML diagrams rendered through Kroki.io API as inline SVG',
    content: `# PlantUML Diagrams

OntoWave supports PlantUML diagrams via the Kroki.io API, rendered as inline SVG.

## Component Diagram

\`\`\`plantuml
@startuml
!theme plain

package "OntoWave Architecture" {
  [Router] --> [Markdown Parser]
  [Markdown Parser] --> [HTML Renderer]
  [HTML Renderer] --> [Enhancer]
  [Enhancer] --> [Mermaid]
  [Enhancer] --> [PlantUML/Kroki]
}

database "Content" {
  [index.md]
  [demo.md]
}

[Content] --> [Router]

@enduml
\`\`\`

## Sequence Diagram

\`\`\`plantuml
@startuml
!theme plain

actor User
participant "Browser" as B
participant "OntoWave" as OW
participant "Kroki API" as K

User -> B: Open page
B -> OW: Load script
OW -> OW: Detect PlantUML blocks
OW -> K: POST diagram source
K --> OW: Return SVG
OW -> B: Inject SVG inline
B --> User: Display diagram
@enduml
\`\`\`

## Class Diagram

\`\`\`plantuml
@startuml
!theme plain

class AppConfig {
  +roots: Root[]
  +i18n?: I18nConfig
  +ui?: UIConfig
}

class RouterService {
  +get(): Route
  +subscribe(callback)
  +navigate(path)
}

class MarkdownRenderer {
  +render(mdSrc): string
}

class PostRenderEnhancer {
  +afterRender(html, route)
}

AppConfig --* RouterService
RouterService --> MarkdownRenderer
MarkdownRenderer --> PostRenderEnhancer

@enduml
\`\`\`

**Note**: PlantUML diagrams require internet connection to Kroki.io API.
`,
    config: null
  },

  {
    category: '01-base',
    id: 'routing',
    title: 'SPA Routing',
    description: 'Hash-based navigation without page reload, 404 handling',
    content: `# SPA Routing

OntoWave uses hash-based routing for Single Page Application navigation.

## Hash Navigation

Try these links:
- [Section 2](#section-2)
- [Section 3](#section-3)
- [Back to top](#spa-routing)

The page doesn't reload, only the hash changes!

## Section 2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. OntoWave detects hash changes and scrolls to anchors automatically.

## Section 3

You can also use query parameters:
- [View this page in split mode](?view=split)
- [View source only](?view=md)
- [Back to normal](routing.html)

## External Pages

Navigate to other demos:
- [Markdown Features](markdown.html)
- [Mermaid Diagrams](mermaid.html)
- [PlantUML Diagrams](plantuml.html)

## 404 Handling

Try a non-existent page: [This page doesn't exist](nonexistent.html)

OntoWave will show a 404 message automatically.

## URL Structure

\`\`\`
#/path/to/page?view=split&custom=param
│ │           └─────┬─────┘
│ │                 │
│ │                 └─ Query parameters
│ └─ Path (can be nested: /fr/demo/page)
└─ Hash symbol (SPA routing)
\`\`\`
`,
    config: null
  },

  // === 02-config: Configurations avancées ===
  {
    category: '02-config',
    id: 'i18n',
    title: 'Internationalization',
    description: 'Auto language detection, fallback, multilingual routing',
    contentFr: `# Internationalisation

OntoWave détecte automatiquement la langue du navigateur et charge le contenu approprié.

## Détection Automatique

- Langue du navigateur: détectée via \`navigator.language\`
- Fallback: langue par défaut si non supportée
- Routing multilingue: \`/fr/page\`, \`/en/page\`

## Configuration

\`\`\`javascript
window.ontoWaveConfig = {
  i18n: {
    default: "fr",
    supported: ["fr", "en", "es"]
  },
  roots: [
    { base: "/fr", root: "/docs/fr/" },
    { base: "/en", root: "/docs/en/" },
    { base: "/es", root: "/docs/es/" }
  ]
};
\`\`\`

## Exemples

Vous lisez actuellement la version française 🇫🇷

Essayez: [Version anglaise](i18n.html?lang=en)
`,
    contentEn: `# Internationalization

OntoWave automatically detects the browser language and loads the appropriate content.

## Auto Detection

- Browser language: detected via \`navigator.language\`
- Fallback: default language if not supported
- Multilingual routing: \`/fr/page\`, \`/en/page\`

## Configuration

\`\`\`javascript
window.ontoWaveConfig = {
  i18n: {
    default: "en",
    supported: ["fr", "en", "es"]
  },
  roots: [
    { base: "/fr", root: "/docs/fr/" },
    { base: "/en", root: "/docs/en/" },
    { base: "/es", root: "/docs/es/" }
  ]
};
\`\`\`

## Examples

You are currently reading the English version 🇬🇧

Try: [French version](i18n.html?lang=fr)
`,
    config: {
      i18n: {
        default: "fr",
        supported: ["fr", "en"]
      }
    }
  },

  {
    category: '02-config',
    id: 'view-modes',
    title: 'View Modes',
    description: 'Split view (source + render), source-only, normal rendering',
    content: `# View Modes

OntoWave supports different rendering modes via query parameters.

## Available Modes

### Normal Mode (default)
Shows only the rendered HTML/SVG output.

[View in normal mode](view-modes.html)

### Split View (\`?view=split\`)
Shows Markdown source and rendered output side-by-side.

[View in split mode](?view=split)

### Source-Only Mode (\`?view=md\`)
Shows only the Markdown source code.

[View source only](?view=md)

## Configuration

No special config needed - view modes work with query parameters:

\`\`\`html
<!-- Just add ?view parameter to URL -->
<a href="page.html?view=split">Split View</a>
<a href="page.html?view=md">Source Only</a>
\`\`\`

## Use Cases

| Mode | Use Case |
|:-----|:---------|
| Normal | End-user documentation reading |
| Split | Content editing, debugging |
| MD | Copy source, inspect raw markdown |

## Example Table

| Feature | Split View | MD View | Normal |
|:--------|:----------:|:-------:|:------:|
| HTML Render | ✅ | ❌ | ✅ |
| MD Source | ✅ | ✅ | ❌ |
| Side-by-side | ✅ | ❌ | ❌ |

## Code Example

\`\`\`javascript
// No JavaScript needed!
// Just append ?view= to your URL
window.location.href += '?view=split';
\`\`\`
`,
    config: null
  },

  {
    category: '02-config',
    id: 'ui-custom',
    title: 'UI Customization',
    description: 'Toggle sidebar, header, TOC, footer, minimal mode',
    content: `# UI Customization

OntoWave allows customizing the user interface via configuration.

## UI Options

\`\`\`javascript
window.ontoWaveConfig = {
  ui: {
    header: true,    // Show header banner
    sidebar: true,   // Show sidebar with TOC
    toc: true,       // Table of contents
    footer: true,    // Show footer
    minimal: false,  // Minimal mode (disables all)
    menu: true       // Floating 🌊 menu
  }
};
\`\`\`

## Minimal Mode Example

Set \`minimal: true\` to disable all UI chrome:

\`\`\`javascript
window.ontoWaveConfig = {
  ui: { minimal: true }
};
\`\`\`

Perfect for embedding OntoWave in iframes or widgets.

## Sidebar with TOC

When \`sidebar: true\`, OntoWave automatically generates a table of contents from H1-H3 headings:

### Section 1
Content here...

### Section 2
More content...

### Section 3
Even more content...

## Header Customization

The header can show breadcrumbs, language selector, and navigation menu.

## Footer

The footer shows copyright, links, or custom content.

## Comparison

| Mode | Use Case | UI Elements |
|:-----|:---------|:------------|
| Full UI | Documentation site | All enabled |
| Minimal | Embedded widget | None |
| Custom | Tailored experience | Pick & choose |
`,
    config: {
      ui: {
        header: true,
        sidebar: true,
        toc: true,
        footer: true,
        minimal: false,
        menu: true
      }
    }
  }
];

// === Template HTML ===
function generateHTML(demo) {
  const configBlock = demo.config 
    ? `  <script>
    window.ontoWaveConfig = ${JSON.stringify(demo.config, null, 4)};
  </script>` 
    : '';

  const sourceFile = demo.id === 'i18n' 
    ? `${demo.id}.fr.md` 
    : `${demo.id}.md`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${demo.title} - OntoWave Demo</title>
  <meta name="description" content="${demo.description}">
</head>
<body>
  <!-- OntoWave CDN -->
  <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
${configBlock}
</body>
</html>
`;
}

// === Template Playwright Spec ===
function generateSpec(demo) {
  const specName = `${demo.category}-${demo.id}`;
  
  return `import { test, expect } from '@playwright/test';

/**
 * Demo: ${demo.title}
 * ${demo.description}
 */
test.describe('Demo ${demo.category}: ${demo.title}', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    
    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('❌ Browser console error:', msg.text());
      }
    });
    
    // Track page errors
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.error('❌ Page error:', err.message);
    });
  });

  test('should load without console errors', async ({ page }) => {
    await page.goto('/docs/demos/${demo.category}/${demo.id}.html');
    
    // Wait for OntoWave to load
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(1000); // Allow async rendering
    
    // Check no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render main content', async ({ page }) => {
    await page.goto('/docs/demos/${demo.category}/${demo.id}.html');
    
    // Wait for H1
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check H1 text
    const h1 = await page.textContent('h1');
    expect(h1).toBeTruthy();
    expect(h1.length).toBeGreaterThan(0);
    
    console.log('✅ H1 found:', h1);
  });

  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/docs/demos/${demo.category}/${demo.id}.html');
    
    // Wait for content
    await page.waitForSelector('h1');
    await page.waitForTimeout(2000); // Allow diagrams to render
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('${specName}.png', {
      fullPage: true,
      maxDiffPixels: 100  // Tolerance
    });
  });
});
`;
}

// === Catalogue HTML ===
function generateCatalogHTML(demos) {
  const categories = [...new Set(demos.map(d => d.category))];
  
  let catalogContent = '';
  categories.forEach(cat => {
    const catDemos = demos.filter(d => d.category === cat);
    const catTitle = cat === '01-base' ? '✨ Base Features' : '⚙️ Advanced Configuration';
    
    catalogContent += `
    <section>
      <h2>${catTitle}</h2>
      <div class="demo-grid">
`;
    
    catDemos.forEach(demo => {
      catalogContent += `
        <div class="demo-card">
          <h3><a href="${cat}/${demo.id}.html">${demo.title}</a></h3>
          <p>${demo.description}</p>
          <div class="demo-links">
            <a href="${cat}/${demo.id}.html">Demo</a>
            <a href="${cat}/${demo.id}.html?view=split">Split View</a>
            <a href="${cat}/${demo.id}.html?view=md">Source</a>
          </div>
        </div>
`;
    });
    
    catalogContent += `
      </div>
    </section>
`;
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OntoWave Demos - Interactive Showcase</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 0.5rem;
    }
    h2 {
      color: #1e40af;
      margin-top: 2rem;
    }
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 1rem 0;
    }
    .demo-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .demo-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .demo-card h3 {
      margin: 0 0 0.5rem 0;
      color: #1e40af;
    }
    .demo-card h3 a {
      text-decoration: none;
      color: inherit;
    }
    .demo-card h3 a:hover {
      text-decoration: underline;
    }
    .demo-card p {
      color: #666;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }
    .demo-links {
      display: flex;
      gap: 0.5rem;
    }
    .demo-links a {
      background: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .demo-links a:hover {
      background: #1e40af;
    }
    footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>🌊 OntoWave v1.0.9 - Interactive Demos</h1>
  
  <p>
    Explore OntoWave features through interactive demonstrations.
    Each demo is also a Playwright test for regression detection.
  </p>

  ${catalogContent}

  <footer>
    <p>
      <strong>OntoWave</strong> - Lightweight JavaScript library for interactive documentation<br>
      <a href="https://www.npmjs.com/package/ontowave">npm</a> |
      <a href="https://github.com/stephanedenis/OntoWave">GitHub</a> |
      <a href="../index.html">Documentation</a>
    </p>
  </footer>
</body>
</html>
`;
}

// === Main Generation ===
function main() {
  console.log('🏗️  Generating OntoWave demos...\n');

  // Create directories
  [DEMOS_DIR, SPECS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  let generatedCount = 0;

  DEMO_CATALOG.forEach(demo => {
    const categoryDir = path.join(DEMOS_DIR, demo.category);
    fs.mkdirSync(categoryDir, { recursive: true });

    // Generate HTML
    const htmlPath = path.join(categoryDir, `${demo.id}.html`);
    fs.writeFileSync(htmlPath, generateHTML(demo));
    console.log(`✅ ${demo.category}/${demo.id}.html`);

    // Generate Markdown
    if (demo.id === 'i18n') {
      // Special case: deux fichiers pour i18n
      fs.writeFileSync(path.join(categoryDir, `${demo.id}.fr.md`), demo.contentFr);
      fs.writeFileSync(path.join(categoryDir, `${demo.id}.en.md`), demo.contentEn);
      console.log(`✅ ${demo.category}/${demo.id}.fr.md`);
      console.log(`✅ ${demo.category}/${demo.id}.en.md`);
    } else {
      fs.writeFileSync(path.join(categoryDir, `${demo.id}.md`), demo.content);
      console.log(`✅ ${demo.category}/${demo.id}.md`);
    }

    // Generate Playwright spec
    const specPath = path.join(SPECS_DIR, `${demo.category}-${demo.id}.spec.js`);
    fs.writeFileSync(specPath, generateSpec(demo));
    console.log(`✅ tests/e2e/demos/${demo.category}-${demo.id}.spec.js`);

    generatedCount++;
    console.log('');
  });

  // Generate catalog
  const catalogPath = path.join(DEMOS_DIR, 'index.html');
  fs.writeFileSync(catalogPath, generateCatalogHTML(DEMO_CATALOG));
  console.log(`✅ docs/demos/index.html (catalog)\n`);

  console.log(`🎉 Generated ${generatedCount} demos with specs!\n`);
  console.log('Next steps:');
  console.log('  1. npm run build  # Build OntoWave');
  console.log('  2. npx playwright test tests/e2e/demos/ --update-snapshots');
  console.log('  3. npx playwright test tests/e2e/demos/ --reporter=html');
}

// Run
if (require.main === module) {
  main();
}

module.exports = { DEMO_CATALOG, generateHTML, generateSpec };
