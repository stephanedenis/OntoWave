# 🌊 OntoWave Package

**OntoWave** est un package JavaScript simple pour créer des sites de documentation interactive avec support Mermaid et PlantUML. Il suffit d'un seul include !

## ⚡ Installation Ultra-Simple

### Option 1: CDN (Recommandé)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma Documentation</title>
</head>
<body>
    <!-- OntoWave Package - Un seul include suffit -->
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
</html>
```

### Option 2: NPM

```bash
npm install ontowave
```

```html
<script src="node_modules/ontowave/dist/ontowave.min.js"></script>
```

## 🎯 Configuration Optionnelle

Ajoutez un bloc de configuration JSON dans votre HTML pour personnaliser OntoWave :

```html
<script type="application/json" id="ontowave-config">
{
    "title": "Ma Documentation",
    "baseUrl": "/",
    "defaultPage": "index.md",
    "mermaid": {
        "theme": "default",
        "startOnLoad": true
    },
    "plantuml": {
        "server": "https://www.plantuml.com/plantuml",
        "format": "svg"
    },
    "navigation": {
        "showHome": true,
        "showBreadcrumb": true,
        "showToc": true
    },
    "ui": {
        "theme": "default",
        "responsive": true,
        "animations": true
    }
}
</script>

<script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
```

## 🚀 Fonctionnalités

- ✅ **Chargement immédiat** - Pas d'attente
- ✅ **Support Mermaid** - Diagrammes automatiquement rendus
- ✅ **Support PlantUML** - Via serveur public intégré
- ✅ **Navigation hash** - URLs stables et partageables
- ✅ **Responsive** - Fonctionne sur mobile et desktop
- ✅ **Zero configuration** - Marche out-of-the-box
- ✅ **Léger** - Un seul fichier JS à inclure

## 📝 Structure des Fichiers

Créez simplement vos fichiers Markdown :

```
/
├── index.html          (votre page avec OntoWave)
├── index.md           (page d'accueil)
├── en/
│   └── index.md       (version anglaise)
├── fr/
│   └── index.md       (version française)
└── demo/
    ├── mermaid.md     (démos Mermaid)
    └── plantuml.md    (démos PlantUML)
```

## 🎨 Support des Diagrammes

### Mermaid

```markdown
# Mon Diagramme

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
\`\`\`
```

### PlantUML

```markdown
# Diagramme UML

\`\`\`plantuml
@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi!
@enduml
\`\`\`
```

## 🔧 API JavaScript

OntoWave expose une API simple pour l'utilisation avancée :

```javascript
// Navigation programmatique
window.OntoWave.navigate('demo/mermaid.md');

// Obtenir la configuration
const config = window.OntoWave.getConfig();

// Mettre à jour la configuration
window.OntoWave.updateConfig({
    title: "Nouveau Titre"
});
```

## 🎯 Exemples Complets

### Minimal
```html
<!DOCTYPE html>
<html>
<head><title>Docs</title></head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
</html>
```

### Avec Configuration
```html
<!DOCTYPE html>
<html>
<head><title>Ma Documentation</title></head>
<body>
    <script type="application/json" id="ontowave-config">
    {
        "title": "Documentation Projet X",
        "defaultPage": "guide/start.md",
        "mermaid": { "theme": "dark" }
    }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
</html>
```

## 📦 Taille du Package

- **ontowave.js**: ~102KB (non compressé)
- **ontowave.min.js**: ~69KB (minifié)
- **Gzipped**: ~15KB (estimé)

## 🔗 Liens

- **Repository**: https://github.com/stephanedenis/OntoWave
- **CDN**: https://cdn.jsdelivr.net/npm/ontowave/
- **NPM**: https://www.npmjs.com/package/ontowave

## 📄 Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Créé avec ❤️ pour simplifier la documentation interactive**
