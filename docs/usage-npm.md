# 📦 Utilisation JavaScript / NPM - OntoWave

Guide complet pour utiliser OntoWave avec JavaScript et NPM.

---

## 🚀 Installation via NPM

```bash
npm install ontowave
```

## 💻 Utilisation JavaScript

### Import ES6

```javascript
import ontowave from 'ontowave';

// Rendu markdown simple
const html = ontowave.render('# Hello World');
document.getElementById('content').innerHTML = html;
```

### Import CommonJS

```javascript
const ontowave = require('ontowave');

const html = ontowave.render('# Hello World');
document.getElementById('content').innerHTML = html;
```

### Script Tag (Navigateur)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OntoWave Demo</title>
</head>
<body>
    <div id="content"></div>
    
    <!-- Depuis unpkg CDN -->
    <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
    
    <script>
        // OntoWave est disponible globalement
        const markdown = '# Hello World\n\n| A | B |\n|:--|--:|\n| 1 | 2 |';
        document.getElementById('content').innerHTML = marked.parse(markdown);
    </script>
</body>
</html>
```

---

## 📋 API OntoWave

### `ontowave.render(markdown)`

Transforme du markdown en HTML.

**Paramètres:**
- `markdown` (string) - Contenu markdown à transformer

**Retourne:**
- `string` - HTML généré

**Exemple:**

```javascript
const markdown = `
# Mon Document

| Produit | Prix |
|:--------|-----:|
| Item A  | 10€  |
| Item B  | 20€  |
`;

const html = ontowave.render(markdown);
console.log(html);
```

---

## 🎯 Exemples Pratiques

### Exemple 1: Application Simple

```javascript
import ontowave from 'ontowave';

class MarkdownViewer {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }
    
    load(markdownUrl) {
        fetch(markdownUrl)
            .then(response => response.text())
            .then(markdown => {
                const html = ontowave.render(markdown);
                this.element.innerHTML = html;
            });
    }
}

// Utilisation
const viewer = new MarkdownViewer('content');
viewer.load('docs/readme.md');
```

### Exemple 2: Avec React

```jsx
import React, { useState, useEffect } from 'react';
import ontowave from 'ontowave';

function MarkdownComponent({ markdownUrl }) {
    const [html, setHtml] = useState('');
    
    useEffect(() => {
        fetch(markdownUrl)
            .then(res => res.text())
            .then(md => setHtml(ontowave.render(md)));
    }, [markdownUrl]);
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default MarkdownComponent;
```

### Exemple 3: Avec Vue.js

```vue
<template>
    <div v-html="html"></div>
</template>

<script>
import ontowave from 'ontowave';

export default {
    data() {
        return {
            html: ''
        };
    },
    async mounted() {
        const response = await fetch('docs/readme.md');
        const markdown = await response.text();
        this.html = ontowave.render(markdown);
    }
};
</script>
```

---

## 🔧 Configuration Avancée

### Configuration Inline (Navigateur)

```html
<script>
window.ontoWaveConfig = {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    sources: {
        fr: "index.fr.md",
        en: "index.en.md"
    },
    enablePrism: true,
    enableMermaid: true,
    enablePlantUML: true,
    enableSearch: true
};
</script>
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

### Options Disponibles

| Option | Type | Défaut | Description |
|:-------|:-----|:-------|:------------|
| `locales` | string[] | `["fr"]` | Langues supportées |
| `defaultLocale` | string | `"fr"` | Langue par défaut |
| `sources` | object | - | Sources markdown par langue |
| `enablePrism` | boolean | `true` | Coloration syntaxique |
| `enableMermaid` | boolean | `true` | Diagrammes Mermaid |
| `enablePlantUML` | boolean | `true` | Diagrammes PlantUML |
| `enableSearch` | boolean | `true` | Recherche dans contenu |

---

## 📦 Bundlers

### Webpack

```javascript
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            {
                test: /\.md$/,
                type: 'asset/source'
            }
        ]
    }
};

// src/index.js
import ontowave from 'ontowave';
import readme from './README.md';

document.getElementById('content').innerHTML = ontowave.render(readme);
```

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    assetsInclude: ['**/*.md']
});

// src/main.js
import ontowave from 'ontowave';

fetch('/README.md')
    .then(res => res.text())
    .then(md => {
        document.getElementById('content').innerHTML = ontowave.render(md);
    });
```

---

## 🧪 Tests

### Test avec Jest

```javascript
import ontowave from 'ontowave';

describe('OntoWave', () => {
    test('renders markdown to HTML', () => {
        const markdown = '# Hello World';
        const html = ontowave.render(markdown);
        expect(html).toContain('<h1>');
        expect(html).toContain('Hello World');
    });
    
    test('renders tables with alignments', () => {
        const markdown = `
| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |
        `;
        const html = ontowave.render(markdown);
        expect(html).toContain('text-left');
        expect(html).toContain('text-center');
        expect(html).toContain('text-right');
    });
});
```

---

## 📚 Ressources

- 📦 [Package NPM](https://www.npmjs.com/package/ontowave)
- 🐙 [Code Source](https://github.com/stephanedenis/OntoWave)
- 📖 [Documentation Complète](index.md)
- 🎨 [Exemples](demo-tables.md)

---

*[◀️ Retour à l'accueil](index.md)*
