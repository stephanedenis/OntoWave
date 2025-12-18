# 🌊 OntoWave - Setup Ultra-Minimal

## ⚡ HTML Minimal - Une Seule Ligne !

Créez un fichier HTML avec **une seule ligne de script** :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Documentation</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <!-- UNE SEULE LIGNE SUFFIT ! -->
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
</html>
```

**C'est tout !** 🎯

## 🚀 Fonctionnalités Automatiques

Avec cette seule ligne, vous obtenez :

- ✅ **Interface complète** - Sidebar, navigation, contenu
- ✅ **Markdown automatique** - Charge et affiche `index.md`
- ✅ **Mermaid intégré** - Diagrammes rendus automatiquement
- ✅ **PlantUML support** - Via serveur public
- ✅ **Navigation hash** - URLs partageables (`#/page.md`)
- ✅ **Responsive design** - Mobile-friendly
- ✅ **Recherche** - Interface de recherche
- ✅ **Table des matières** - Générée automatiquement

## 📝 Configuration Optionnelle

Si vous voulez personnaliser, ajoutez un script JSON **avant** l'import :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Documentation Personnalisée</title>
</head>
<body>
    <!-- Configuration optionnelle -->
    <script type="application/json" id="ontowave-config">
    {
        "title": "Ma Docs Personnalisée",
        "defaultPage": "guide.md",
        "mermaid": {
            "theme": "dark"
        }
    }
    </script>
    
    <!-- Import OntoWave -->
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
</body>
</html>
```

## 🎯 Exemples Pratiques

### 1. Démo Locale
```html
<script src="./dist/ontowave.min.js"></script>
```

### 2. CDN Production  
```html
<script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
```

### 3. Version Spécifique
```html
<script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.0/dist/ontowave.min.js"></script>
```

## 📂 Structure de Fichiers

```
mon-site/
├── index.html          ← Votre HTML minimal
├── index.md            ← Page d'accueil (chargée automatiquement)
├── guide.md            ← Autres pages
├── config.md           ← Documentation
└── api.md              ← Référence
```

## 🔗 Navigation Automatique

Tous les liens `.md` dans vos fichiers Markdown deviennent automatiquement navigables :

```markdown
Voir aussi :
- [Configuration](config.md)
- [Guide](guide.md)  
- [API](api.md)
```

## 🎨 Diagrammes Intégrés

### Mermaid
```markdown
\`\`\`mermaid
graph TD
    A[Utilisateur] --> B[OntoWave]
    B --> C[Documentation]
\`\`\`
```

### PlantUML
```markdown
\`\`\`plantuml
@startuml
User -> OntoWave: Charge HTML
OntoWave -> Markdown: Parse contenu  
Markdown -> User: Affiche docs
@enduml
\`\`\`
```

## 💡 Avantages

| Aspect | Bénéfice |
|--------|----------|
| **Simplicité** | Une seule ligne HTML |
| **Zéro config** | Fonctionne immédiatement |
| **Léger** | ~18KB minifié |
| **Complet** | Toutes les fonctionnalités |
| **Moderne** | Interface responsive |
| **Rapide** | Chargement instantané |

## 🚀 Déploiement

1. **Créez** votre HTML minimal
2. **Ajoutez** vos fichiers `.md`
3. **Déployez** sur n'importe quel serveur web
4. **Partagez** vos URLs avec hash navigation

**Hébergement compatible :**
- GitHub Pages
- Netlify
- Vercel
- S3 + CloudFront
- Apache/Nginx
- Serveur local

---

**OntoWave : La solution la plus simple pour créer une documentation interactive !** 🌊
