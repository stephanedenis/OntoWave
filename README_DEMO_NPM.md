# 🌊 OntoWave v1.0.1 - Démo NPM

## 📦 Utilisation via NPM/unpkg.com

Cette démonstration montre comment utiliser OntoWave v1.0.1 publié sur NPM via le CDN unpkg.com.

### 🚀 Installation

```bash
npm install ontowave
```

### 💻 Utilisation Simple

#### Via CDN (unpkg.com)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Page avec OntoWave</title>
</head>
<body>
    <div id="content"></div>
    
    <!-- OntoWave depuis NPM -->
    <script src="https://unpkg.com/ontowave@1.0.1/dist/ontowave.min.js"></script>
    
    <script>
        // Votre code ici
        document.getElementById('content').innerHTML = '# Hello World';
    </script>
</body>
</html>
```

#### Via NPM (avec bundler)

```javascript
import ontowave from 'ontowave';

// Utilisation
const contentDiv = document.getElementById('content');
contentDiv.innerHTML = ontowave.render('# Hello World');
```

### 🎯 Fonctionnalités Principales

- ✅ **Tableaux Markdown** avec alignements complets (left/center/right)
- ✅ **Rendu CSS professionnel** avec hover, zebra striping
- ✅ **Auto-chargement** du contenu markdown
- ✅ **Sans dépendances** - tout en un seul fichier

### 📋 Exemples de Tableaux

#### Alignement Centre
```markdown
| Colonne 1 | Colonne 2 |
|:---------:|:---------:|
| Centré    | Aussi     |
```

#### Alignement Droite
```markdown
| Produit    | Prix   |
|:-----------|-------:|
| Ordinateur | 999€   |
| Souris     | 25€    |
```

#### Alignement Mixte
```markdown
| Nom     | Quantité | Prix  |
|:--------|:--------:|------:|
| Item A  | 5        | 100€  |
| Item B  | 3        | 50€   |
```

### 🌐 Pages de Démonstration

- **demo-npm.html** - Démonstration complète avec auto-chargement
- **demo-npm-simple.html** - Version minimaliste avec chargement manuel

### 🔗 Liens

- 📦 NPM: https://www.npmjs.com/package/ontowave
- 🐙 GitHub: https://github.com/stephanedenis/OntoWave
- 📚 Documentation: Voir index.md pour exemples complets

### ✨ Nouveautés v1.0.1

- ✅ Fix tableaux markdown avec alignements complets
- ✅ Suppression commentaires CSS problématiques
- ✅ Workflow NPM automatique opérationnel
- ✅ Documentation et règles d'autonomie agents

---

**Publié le 2025-10-16** 🎉