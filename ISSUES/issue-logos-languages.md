# Issue 4: Amélioration des logos et documentation des langages supportés

## 📋 Description

Améliorer l'iconographie d'OntoWave en utilisant les logos officiels spécifiques pour PlantUML et Mermaid, et documenter clairement tous les langages de programmation supportés par Prism.

## 🎯 Problèmes identifiés

### 1. Logos génériques au lieu des logos officiels
- **PlantUML** utilise actuellement 📊 (graphique générique)
- **Mermaid** utilise actuellement 📊 (graphique générique)
- Ces outils ont leurs propres identités visuelles distinctes

### 2. Documentation incomplète des langages Prism
- Les langages supportés ne sont pas clairement documentés
- Distinction floue entre langages essentiels et additionnels

## 🎨 Logos officiels à implémenter

### PlantUML
- **Logo officiel :** Fait référence à une "usine" (plant = factory, pas plante)
- **Symbole Unicode suggéré :** 🏭 (usine) ou ⚙️ (engrenage)
- **Alternative SVG :** Logo officiel PlantUML depuis leur site

### Mermaid
- **Logo officiel :** Sirène stylisée
- **Symbole Unicode suggéré :** 🧜‍♀️ (sirène) ou 🌊 (vagues)
- **Alternative SVG :** Logo officiel Mermaid

## 🔤 Langages Prism actuellement supportés

### Essentiels (chargés immédiatement)
```javascript
const essentialLanguages = ['markup', 'css', 'javascript'];
```
- **markup** (HTML/XML)
- **css** (feuilles de style)
- **javascript** (JS/ES6+)

### Additionnels (chargés en arrière-plan)
```javascript
const additionalLanguages = ['python', 'java', 'bash', 'json', 'yaml', 'typescript', 'php'];
```
- **python** - Scripts Python
- **java** - Code Java
- **bash** - Scripts shell/terminal
- **json** - Données JSON
- **yaml** - Configuration YAML
- **typescript** - TypeScript
- **php** - Scripts PHP

### Alias automatiques
- **html** → **markup** (créé automatiquement)

## 🔧 Implémentation proposée

### 1. Mise à jour des logos

#### Dans `dist/ontowave.js` - Ligne 1007
```javascript
// Avant
<div style="margin-bottom: 8px; font-weight: bold; color: #586069;">📊 Diagramme PlantUML</div>

// Après
<div style="margin-bottom: 8px; font-weight: bold; color: #586069;">🏭 Diagramme PlantUML</div>
```

#### Dans `dist/ontowave.js` - Ligne 881 (démos)
```javascript
// Avant
{ href: 'demo/plantuml.md', icon: '📊', label: 'PlantUML' },

// Après
{ href: 'demo/plantuml.md', icon: '🏭', label: 'PlantUML' },
```

#### Pour Mermaid (à identifier dans le code)
```javascript
// Remplacer 📊 par 🧜‍♀️ ou 🌊 pour Mermaid
```

### 2. Documentation des langages supportés

#### Nouveau panneau dans la configuration
```html
<div class="config-section">
  <h4>🔤 Langages de code supportés</h4>
  
  <div class="language-grid">
    <div class="language-group">
      <h5>Essentiels (toujours disponibles)</h5>
      <div class="language-tags">
        <span class="lang-tag">HTML</span>
        <span class="lang-tag">CSS</span>
        <span class="lang-tag">JavaScript</span>
      </div>
    </div>
    
    <div class="language-group">
      <h5>Additionnels (chargement automatique)</h5>
      <div class="language-tags">
        <span class="lang-tag">Python</span>
        <span class="lang-tag">Java</span>
        <span class="lang-tag">TypeScript</span>
        <span class="lang-tag">PHP</span>
        <span class="lang-tag">Bash</span>
        <span class="lang-tag">JSON</span>
        <span class="lang-tag">YAML</span>
      </div>
    </div>
  </div>
</div>
```

#### CSS pour les tags de langages
```css
.language-grid {
  display: grid;
  gap: 15px;
}

.language-group h5 {
  margin: 0 0 8px 0;
  color: #586069;
  font-size: 0.9em;
}

.language-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lang-tag {
  background: #f6f8fa;
  border: 1px solid #d1d9e0;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.8em;
  color: #586069;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
```

### 3. Documentation utilisateur

#### Dans `docs/index.md`
```markdown
## 🎨 Syntaxe et diagrammes supportés

### 🏭 PlantUML
Diagrammes UML avec le serveur officiel PlantUML.

### 🧜‍♀️ Mermaid  
Diagrammes interactifs avec Mermaid.js.

### 🔤 Coloration syntaxique (Prism.js)
**Langages essentiels :** HTML, CSS, JavaScript  
**Langages additionnels :** Python, Java, TypeScript, PHP, Bash, JSON, YAML

[Voir tous les exemples de syntaxe →](gallery.html)
```

## 🎯 Bénéfices attendus

### Identité visuelle améliorée
- **Reconnaissance immédiate** des outils spécifiques
- **Professionnalisme** avec logos officiels
- **Cohérence** avec les écosystèmes PlantUML et Mermaid

### Documentation claire
- **Transparence** sur les capacités de coloration
- **Guide utilisateur** pour choisir les langages
- **Référence rapide** des fonctionnalités

### Expérience développeur
- **Feedback visuel** approprié pour chaque outil
- **Attentes claires** sur les langages supportés
- **Débogage facilité** avec identification précise

## 📁 Fichiers à modifier

### Code principal
- `dist/ontowave.js` (logos PlantUML et Mermaid)
- Panneau de configuration (nouvelle section langages)

### Documentation
- `docs/index.md` (section syntaxe et diagrammes)
- Fichiers d'exemples (mise à jour des icônes)

### Tests
- Vérification des nouveaux logos
- Tests de la documentation des langages

## 🔄 Phases d'implémentation

### Phase 1: Recherche des logos officiels
- Identifier tous les usages actuels de 📊
- Récupérer les logos officiels PlantUML et Mermaid
- Définir les alternatives Unicode

### Phase 2: Mise à jour des logos
- Remplacer les icônes génériques
- Tester l'affichage sur différents navigateurs
- Valider la cohérence visuelle

### Phase 3: Documentation des langages
- Créer la section dans le panneau de configuration
- Ajouter les styles CSS appropriés
- Mettre à jour la documentation utilisateur

### Phase 4: Tests et validation
- Vérifier tous les affichages
- Tester la documentation interactive
- Valider l'expérience utilisateur

## 🎨 Alternatives de logos

### PlantUML
1. **🏭** (Factory) - Référence directe à "plant" = usine
2. **⚙️** (Gear) - Symbolise la génération/fabrication
3. **🔧** (Wrench) - Outil de construction
4. **📐** (Triangular ruler) - Outil de conception

### Mermaid
1. **🧜‍♀️** (Mermaid) - Référence directe au nom
2. **🌊** (Wave) - Élément aquatique
3. **🐠** (Fish) - Écosystème marin
4. **💎** (Diamond) - Forme des nœuds Mermaid

## ⏰ Priorité

Moyenne-Haute - Amélioration visuelle importante mais non critique

## 📝 Notes d'implémentation

- Vérifier la compatibilité Unicode sur tous les navigateurs cibles
- Considérer l'ajout d'images SVG pour les logos si Unicode insuffisant
- Maintenir la cohérence avec le style visuel existant d'OntoWave
- Tester l'affichage sur différentes tailles d'écran
