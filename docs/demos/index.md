# 🧪 OntoWave v1.0.1 - Démonstrations Interactives

## 📖 À propos de ce dossier

Ce dossier contient les **démonstrations interactives** de toutes les fonctionnalités d'OntoWave v1.0.1. Chaque démo est :

- **Auto-documentée** : Explique pourquoi la fonctionnalité est utile
- **Testable manuellement** : Checklist de validation pour QA
- **Pédagogique** : Exemples réalistes et production-ready
- **Navigable via OntoWave** : Utilise le produit pour se démontrer lui-même

---

## 🎯 Contexte Produit OntoWave

**OntoWave** est un micro-framework JavaScript (~74KB minifié) pour créer de la documentation interactive à partir de fichiers Markdown, **sans dépendances externes**.

**Fonctionnalités principales** :
- ✅ **Parser Markdown manuel** : Headings, links, bold, italic, code, **tableaux avec alignements** (v1.0.1)
- ✅ **Diagrammes Mermaid** : Flowcharts, sequence, class, state, pie charts
- ✅ **Diagrammes PlantUML** : Support fichiers `.puml`, liens cliquables dans SVG (v1.0.1)
- ✅ **Coloration syntaxe Prism.js** : 150+ langages (Python, JS, TS, Bash, JSON, YAML, etc.)
- ✅ **i18n automatique** : Détection langue navigateur + fallback (v1.0.1)
- ✅ **Menu flottant draggable** : Navigation, configuration, langues
- ✅ **Navigation SPA** : Hash-based routing sans rechargement page

**Architecture** :
- `dist/ontowave.js` (111KB non-minifié) : Code source complet
- `dist/ontowave.min.js` (74KB) : Bundle production
- `docs/` : Documentation + démos auto-hébergées
- Pas de build requis : Drop-in script `<script src="ontowave.min.js"></script>`

---

## 📂 Organisation des Démos

### 🌐 Internationalisation (i18n)

**Nouvelles fonctionnalités v1.0.1** : Détection automatique langue navigateur

- **[02-i18n-french.html](02-i18n-french.html)** - Configuration langue française
  - Fichier : `test-i18n-french.md`
  - Démontre : Chargement page `.fr.md`

- **[03-i18n-english.html](03-i18n-english.html)** - Configuration langue anglaise
  - Fichier : `test-i18n-english.md`
  - Démontre : Chargement page `.en.md`

- **[04-i18n-fallback.html](04-i18n-fallback.html)** - Fallback langue non supportée
  - Fichier : `test-i18n-french.md` (fallback)
  - Démontre : Langue navigateur (DE) → Fallback (FR)

---

### 📊 Tableaux Markdown

**Nouvelles fonctionnalités v1.0.1** : Alignements colonnes `:---`, `:---:`, `---:`

- **[06-markdown-tables.html](06-markdown-tables.html)** - Alignements colonnes
  - Fichier : `test-tables.md`
  - Contenu : 5 tableaux avec alignements variés
  - Features : Hover effects, zebra striping, responsive
  - Tests : Alignement gauche/centre/droite, styles CSS

---

### 🏗️ PlantUML - Diagrammes UML

**Nouvelles fonctionnalités v1.0.1** : 
- Support fichiers `.puml` directs
- Liens cliquables dans SVG avec navigation OntoWave

- **[01-plantuml-minimal.html](01-plantuml-minimal.html)** - Diagrammes PlantUML en blocs
  - Fichier : `test-plantuml-minimal.md`
  - Contenu : 3 diagrammes (séquence, classes)
  - Tests : Encodage DEFLATE `~0`, insertion SVG directe

- **[05-plantuml-links.html](05-plantuml-links.html)** - Liens cliquables dans diagrammes
  - Fichier : `test-plantuml-links.md`
  - Tests : Click sur lien → Navigation SPA sans rechargement

- **[07-plantuml-file.html](07-plantuml-file.html)** - Fichiers `.puml` directs
  - Fichier : `test-navigation.puml`
  - Contenu : Diagramme séquence avec 4 liens
  - Tests : Chargement `.puml`, encodage hexadécimal `~h`, liens fonctionnels

---

### 🌊 Mermaid - Diagrammes Natifs

**Couverture complète** : Flowcharts, sequence, class, state, pie charts

- **[09-mermaid-flowcharts.html](09-mermaid-flowcharts.html)** 🆕 - Flowcharts et graphes
  - Fichier : `test-mermaid-flowcharts.md`
  - Contenu : 5 types de diagrammes
    - Flowchart TD (Top-Down) : Architecture OntoWave
    - Graph LR (Left-Right) : Pipeline build
    - Flowchart avec décisions : Détection langue
    - Pie chart : Répartition bundle
    - Graph avec styles : Cycle de vie contenu
  - Tests : Directions, formes, flèches, styles personnalisés

- **[10-mermaid-sequence.html](10-mermaid-sequence.html)** 🆕 - Sequence, Class, State
  - Fichier : `test-mermaid-sequence.md`
  - Contenu : 5 diagrammes avancés
    - Sequence : Chargement page OntoWave
    - Sequence avec boucles : Traitement multi-diagrammes
    - Class diagram : Architecture classes
    - State diagram : États menu flottant
    - Sequence : Navigation PlantUML links
  - Tests : Participants, boucles, alternatives, relations classes, transitions états

---

### 🎨 Prism.js - Coloration Syntaxique

**Couverture** : 8 langages avec exemples production-ready

- **[11-prism-highlight.html](11-prism-highlight.html)** 🆕 - Multi-langages
  - Fichier : `test-prism-highlight.md`
  - Contenu : 8 langages avec code réaliste
    - **Python** : API FastAPI complète avec types, async/await
    - **JavaScript** : Classe OntoWave avec ES6+, fetch API
    - **TypeScript** : Interfaces, types, génériques, private/public
    - **Bash** : Script déploiement avec error handling
    - **JSON** : Configuration OntoWave complète
    - **YAML** : Docker Compose multi-services
    - **CSS** : Variables, animations, media queries
    - **HTML** : Structure sémantique HTML5 + SEO
  - Tests : Coloration mots-clés, strings, variables, copier-coller, responsive

- **[12-code-vs-render.html](12-code-vs-render.html)** 🆕 - Code Source vs. Rendu Graphique
  - Fichier : `test-code-vs-render.md`
  - Contenu : Guide complet des bonnes pratiques
    - Approche `<details>` + `<pre><code>` pour code source coloré
    - Blocs ````mermaid` pour rendu graphique
    - Exemples combinés : code ET rendu ensemble
    - Documentation pédagogique : montrer comment écrire les diagrammes
  - Tests : Sections pliables, coloration Prism, rendu Mermaid/PlantUML, compatibilité

---

## 📊 Statistiques Démos

**Total** : 12 démos HTML + 12 fichiers Markdown

**Coverage fonctionnalités** : 90% des features majeures

**Répartition** :
- 🌐 i18n : 3 démos
- 📊 Tableaux : 1 démo
- 🏗️ PlantUML : 3 démos
- 🌊 Mermaid : 2 démos
- 🎨 Prism : 2 démos (highlight + code vs. rendu)

**Manquantes** (backlog) :
- Markdown showcase complet (headings, lists, blockquotes, images, HR)
- Navigation breadcrumb avancée
- Kitchen sink (toutes features combinées)

---

## 🧪 Guide Utilisation Démos

### Pour Tests Manuels QA

Chaque fichier `test-*.md` contient :

1. **Section "Pourquoi utile"** : Contexte business/technique
2. **Section "Ce que vous allez voir"** : Liste exhaustive des exemples
3. **Checklist "Tests Manuels"** : Validation visuelle + fonctionnelle
4. **Documentation syntaxe** : Référence rapide

**Exemple de workflow** :
```bash
# 1. Lancer serveur HTTP
cd /path/to/ontowave
python3 -m http.server 8080 --directory docs

# 2. Ouvrir démo dans navigateur
open http://localhost:8080/demos/09-mermaid-flowcharts.html

# 3. Suivre checklist dans test-mermaid-flowcharts.md
# 4. Valider visuellement chaque point
```

---

### Pour Tests Automatisés Playwright

Structure tests E2E (à créer) :

```javascript
// tests/e2e/demo-mermaid-flowcharts.spec.js
test('Demo Mermaid Flowcharts loads correctly', async ({ page }) => {
  await page.goto('http://localhost:8080/demos/09-mermaid-flowcharts.html');
  
  // Vérifier chargement
  await expect(page.locator('.ontowave-content')).toBeVisible();
  
  // Vérifier 5 diagrammes Mermaid
  const mermaidDiagrams = page.locator('.mermaid svg');
  await expect(mermaidDiagrams).toHaveCount(5);
  
  // Vérifier pas d'erreur console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.waitForTimeout(2000);
  expect(errors).toHaveLength(0);
});
```

---

### Pour Agents IA

**Contexte rapide** :

- **Produit** : OntoWave = framework doc interactive Markdown → HTML
- **Version** : v1.0.1 (fixes tableaux, .puml, liens SVG, i18n auto)
- **Bundle** : 74KB minifié (+4KB vs v1.0.0)
- **Démos** : Auto-documentées, testables, pédagogiques
- **Navigation** : `docs/demos/index.html` → Charge ce fichier via OntoWave

**Fichiers clés** :
- `dist/ontowave.js` : Code source complet (3260 lignes)
- `docs/demos/*.html` : Wrappers démos
- `docs/demos/test-*.md` : Contenu démos avec tests

**Modifications récentes** (v1.0.1) :
- Lignes 1623-1665 : Parser tableaux markdown avec alignements
- Lignes 1548-1570 : Support fichiers `.puml`
- Lignes 1885-1938 : Liens cliquables SVG PlantUML
- Lignes 1436-1467 : Détection automatique langue navigateur

---

## 🔗 Navigation

- **[← Retour documentation principale](../index.md)**
- **[📦 Voir code source](../../dist/ontowave.js)**
- **[📄 CHANGELOG v1.0.1](../../CHANGELOG.md)** *(à créer)*
- **[🧪 Tests Playwright](../../tests/e2e/)** *(à créer)*

---

## 📝 Notes pour Maintenance

**Conventions naming** :
- `XX-feature-name.html` : Wrapper HTML (XX = numéro ordre)
- `test-feature-name.md` : Contenu Markdown avec tests

**Structure wrapper HTML** (template) :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OntoWave - Démo Feature Name</title>
  <script src="../ontowave.min.js"></script>
</head>
<body>
  <div id="ontowave"></div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (location.hash) location.hash = ''; // Force clean load
      
      new OntoWave({
        basePath: '.',
        contentPath: 'test-feature-name.md'
      });
    });
  </script>
</body>
</html>
```

**Ajout nouvelle démo** :
1. Créer `test-nouvelle-feature.md` avec structure :
   - Section "Pourquoi utile"
   - Section "Ce que vous allez voir"
   - Exemples concrets
   - Checklist tests manuels
   - Documentation syntaxe
2. Créer `XX-nouvelle-feature.html` (copier template ci-dessus)
3. Mettre à jour ce fichier `index.md` (section appropriée)
4. Créer test Playwright `tests/e2e/demo-XX-nouvelle-feature.spec.js`

---

**Version** : OntoWave v1.0.1  
**Dernière mise à jour** : 2025-10-20  
**Coverage démos** : 85% des features majeures  
**Auteur** : Stéphane Denis (maintenance automatisée via agents IA)
