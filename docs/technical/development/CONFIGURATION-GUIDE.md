# Guide de Configuration OntoWave

## 🎯 Configuration de Base (Zero-Config)

OntoWave fonctionne sans configuration:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Documentation</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

Par défaut:
- Charge `index.md` à la racine
- Menu flottant actif (icône 🌊)
- Langue détectée du navigateur
- Tous les plugins activés

## 🎛️ Configuration Avancée

### Via window.ontoWaveConfig

```html
<script>
window.ontoWaveConfig = {
    // Langues supportées
    locales: ["fr", "en"],
    defaultLocale: "fr",
    
    // Sources de contenu
    sources: {
        fr: "index.fr.md",
        en: "index.en.md"
    },
    
    // Interface utilisateur
    ui: {
        menu: false,              // ⭐ Désactiver le menu flottant
        header: true,             // En-tête du site
        sidebar: true,            // Barre latérale
        toc: true,                // Table des matières
        minimal: false            // Mode minimal (désactive tout)
    },
    
    // Plugins
    enablePrism: true,            // Coloration syntaxique
    enableMermaid: true,          // Diagrammes Mermaid
    enablePlantUML: true,         // Diagrammes UML
    enableSearch: true,           // Recherche
    
    // Plugins personnalisés
    plugins: {
        enabled: ["analytics", "custom-plugin"],
        config: {
            analytics: {
                trackingId: "UA-XXXXX-Y"
            }
        }
    }
};
</script>
<script src="ontowave.min.js"></script>
```

### Via config.json (Mode Avancé)

Pour les sites complexes, utilisez `/config.json`:

```json
{
  "engine": "v2",
  "locales": ["fr", "en"],
  "defaultLocale": "fr",
  "sources": {
    "fr": "index.fr.md",
    "en": "index.en.md"
  },
  "ui": {
    "menu": true,
    "header": true,
    "sidebar": true,
    "toc": true,
    "minimal": false
  },
  "roots": [
    { "base": "/", "root": "/" }
  ],
  "plugins": {
    "enabled": ["prism", "mermaid", "plantuml"],
    "config": {}
  },
  "externalDataSources": [
    {
      "name": "external-docs",
      "baseUrl": "https://api.example.com/docs",
      "corsEnabled": true,
      "headers": {
        "Authorization": "Bearer TOKEN"
      }
    }
  ]
}
```

## 🌍 Bases de Contenu Externes (CORS)

### Configuration des Sources Externes

OntoWave supporte le chargement de contenu depuis des serveurs externes avec CORS:

```javascript
window.ontoWaveConfig = {
    externalDataSources: [
        {
            name: "external-api",
            baseUrl: "https://api.example.com/docs",
            corsEnabled: true,
            headers: {
                "Authorization": "Bearer YOUR_TOKEN",
                "X-Custom-Header": "value"
            }
        },
        {
            name: "cdn-docs",
            baseUrl: "https://cdn.example.com/documentation",
            corsEnabled: true
        }
    ]
};
```

### Référencement du Contenu Externe

Dans vos liens markdown, utilisez la syntaxe `@sourceName/path`:

```markdown
# Documentation Locale

Voir aussi la [documentation API](@external-api/api-guide.md)

## Contenu Externe

- [Webhooks](@external-api/webhooks.md)
- [Rate Limiting](@external-api/advanced/rate-limiting.md)
- [CDN Docs](@cdn-docs/getting-started.md)
```

### URL Hash avec Contenu Externe

```
https://votresite.com/#@external-api/api-guide.md
```

OntoWave:
1. Détecte le préfixe `@external-api`
2. Résout l'URL complète: `https://api.example.com/docs/api-guide.md`
3. Effectue une requête CORS avec les headers configurés
4. Rend le contenu markdown

### Configuration du Serveur CORS

Le serveur hébergeant le contenu externe doit autoriser CORS:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

Exemple avec Node.js/Express:

```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    next();
});
```

Exemple avec Python HTTP Server:

```python
class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
```

## 🎨 Options UI Détaillées

### Menu Flottant

```javascript
ui: {
    menu: false  // ⭐ Désactiver le menu flottant (actif par défaut)
}
```

Le menu flottant (icône 🌊) permet:
- Changement de langue
- Accès à la configuration
- Navigation rapide

**Cas d'usage pour désactivation:**
- Intégration dans une application existante
- Interface personnalisée complète
- Mode kiosque/présentation

### Mode Minimal

```javascript
ui: {
    minimal: true  // Désactive header, sidebar, toc ET menu
}
```

Pour un contrôle granulaire:

```javascript
ui: {
    header: false,   // Masquer l'en-tête uniquement
    sidebar: false,  // Masquer la barre latérale uniquement
    toc: false,      // Masquer la table des matières uniquement
    menu: false      // Masquer le menu flottant uniquement
}
```

## 🔧 Configuration Dynamique via API

### Charger la Configuration Programmatiquement

```javascript
// Avant de charger OntoWave
window.ontoWaveConfig = await fetch('/api/config')
    .then(r => r.json());

// Charger OntoWave
const script = document.createElement('script');
script.src = 'ontowave.min.js';
document.body.appendChild(script);
```

### Modifier la Configuration à la Volée

```javascript
// Accéder à l'instance OntoWave (si exposée)
if (window.OntoWave) {
    window.OntoWave.updateConfig({
        ui: { menu: false }
    });
}
```

## 📁 Conventions de Noms de Fichiers

OntoWave utilise des conventions pour la découverte automatique:

### Structure Recommandée

```
/
├── index.md              # Page par défaut
├── index.fr.md           # Version française
├── index.en.md           # Version anglaise
├── config.json           # Configuration (optionnel)
├── docs/
│   ├── guide.md
│   └── api.md
└── assets/
    └── images/
```

### Détection Automatique des Langues

Si `index.md` n'existe pas, OntoWave cherche:
1. `index.{langueNavigateur}.md` (ex: `index.fr.md`)
2. `index.{defaultLocale}.md`
3. Premier fichier `.md` trouvé

## 🔍 Ordre de Priorité des Configurations

OntoWave fusionne les configurations dans cet ordre:

1. **Défauts internes** (menu: true, plugins activés, etc.)
2. **config.json** (si présent)
3. **window.ontoWaveConfig** (si défini)
4. **Paramètres URL** (ex: `?lang=en`)

Les configurations ultérieures écrasent les précédentes.

## 💡 Exemples Complets

### Site Documentation Simple

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Documentation</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

### Site Multilingue avec Sources Externes

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Documentation Technique</title>
</head>
<body>
    <script>
    window.ontoWaveConfig = {
        locales: ["fr", "en", "es"],
        defaultLocale: "fr",
        sources: {
            fr: "index.fr.md",
            en: "index.en.md",
            es: "index.es.md"
        },
        ui: {
            menu: true,
            header: true,
            sidebar: true,
            toc: true
        },
        externalDataSources: [
            {
                name: "api-docs",
                baseUrl: "https://api.mycompany.com/docs",
                corsEnabled: true,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('apiToken')
                }
            }
        ],
        enablePrism: true,
        enableMermaid: true,
        enablePlantUML: false
    };
    </script>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

### Application Intégrée (Sans Menu)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon App</title>
</head>
<body>
    <nav id="mon-menu-custom">
        <!-- Votre navigation personnalisée -->
    </nav>
    
    <div id="content-area">
        <!-- OntoWave s'injectera ici -->
    </div>
    
    <script>
    window.ontoWaveConfig = {
        ui: {
            menu: false,      // ⭐ Pas de menu OntoWave
            header: false,    // Pas d'en-tête OntoWave
            sidebar: false    // Pas de sidebar OntoWave
        },
        sources: {
            fr: "docs/help.md"
        }
    };
    </script>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

## 🚀 Prochaines Évolutions

### Configuration des Plugins (v2.0)

```javascript
plugins: {
    enabled: ["prism", "analytics"],
    config: {
        prism: {
            theme: "tomorrow-night",
            languages: ["javascript", "python", "markdown"]
        },
        analytics: {
            provider: "ga4",
            trackingId: "G-XXXXXXXXXX"
        }
    }
}
```

### Routes Dynamiques

```javascript
routes: {
    "/": "index.md",
    "/docs/*": "docs/${path}.md",
    "/api/*": "@external-api/${path}.md"
}
```
