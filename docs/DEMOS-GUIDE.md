# 🎯 OntoWave - Galerie de Démos

## 📁 Structure Démos (`/docs`)

Votre dossier `docs` contient maintenant **5 démos progressives** qui montrent l'évolution d'OntoWave du plus simple au plus complexe :

### 🌟 **1. Minimal** (`01-minimal.html`)
```html
<script src="../dist/ontowave.min.js"></script>
```
- ✅ **1 ligne** HTML
- ✅ **Zéro** configuration  
- ✅ **Documentation** complète automatique

### ⚙️ **2. Configuration de Base** (`02-basic-config.html`)
```json
{
    "title": "Ma Documentation",
    "defaultPage": "index.md",
    "mermaid": { "theme": "default" }
}
```
- ✅ **Configuration** JSON simple
- ✅ **Titre** personnalisé
- ✅ **Thème** Mermaid

### 🌙 **3. Thème Sombre** (`03-dark-theme.html`)
```css
body { background: #1a1a1a !important; }
.ontowave-container { color: #e1e1e1 !important; }
```
- ✅ **Mode sombre** complet
- ✅ **CSS** personnalisé
- ✅ **Mermaid** avec couleurs custom

### 🚀 **4. Configuration Avancée** (`04-advanced-config.html`)
```json
{
    "search": { "enabled": true },
    "navigation": { "showPrevNext": true },
    "content": { "showReadingTime": true }
}
```
- ✅ **Toutes** les options
- ✅ **Recherche** avancée
- ✅ **Navigation** enrichie

### 💎 **5. Style MkDocs** (`05-mkdocs-style.html`)
```css
.ontowave-header { background: #3f51b5; }
.ontowave-sidebar { width: 280px; }
```
- ✅ **Design** MkDocs Material
- ✅ **Layout** professionnel
- ✅ **JavaScript** avancé

## 🎨 **Page d'Accueil** (`index.html`)

**Galerie interactive** qui présente toutes les démos avec :
- 🔢 **Numérotation** progressive
- 🏷️ **Badges** de complexité
- 📱 **Design** responsive
- 🔗 **Navigation** directe

## 📊 **Progression Pédagogique**

| Démo | Complexité | Lignes HTML | Fonctionnalités |
|------|------------|-------------|-----------------|
| **1** | Minimal | 8 | Base OntoWave |
| **2** | Basique | 20 | + Configuration |
| **3** | Intermédiaire | 60 | + Thème custom |
| **4** | Avancé | 100 | + Options complètes |
| **5** | Expert | 200+ | + Layout MkDocs |

## 🎯 **Cas d'Usage**

### 👨‍💻 **Développeur Débutant**
→ Commencer par **01-minimal.html**

### 🎨 **Designer/Intégrateur**  
→ Étudier **03-dark-theme.html** et **05-mkdocs-style.html**

### ⚙️ **Administrateur Système**
→ Analyser **04-advanced-config.html**

### 📚 **Rédacteur Technique**
→ Utiliser **02-basic-config.html**

## 🚀 **Comment Utiliser**

1. **Visitez** `http://localhost:8080/` (galerie)
2. **Explorez** chaque démo dans l'ordre
3. **Copiez** le code qui vous convient
4. **Adaptez** pour vos besoins

## 🎨 **Personnalisation**

Chaque démo peut servir de **base** pour :
- 🏢 **Documentation d'entreprise**
- 📖 **Blog technique**  
- 🎓 **Cours en ligne**
- 🔧 **API documentation**

**Votre dossier `docs` est maintenant une vitrine complète des possibilités OntoWave !** 🌊
