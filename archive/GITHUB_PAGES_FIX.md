# 🔧 Fix GitHub Pages - OntoWave

**Date**: 22 octobre 2025  
**Commit**: 98222f0

## ❌ Problèmes Identifiés

1. **https://stephanedenis.github.io/OntoWave/#index.fr.md** → 404 dans div
   - **Cause**: Fichiers `index.fr.md` et `index.en.md` manquants dans `docs/`
   - **Impact**: Contenu site non chargé, page vide

2. **https://ontowave.org/** → 404 complet
   - **Cause**: Fichier `CNAME` manquant dans `docs/`
   - **Impact**: Domaine personnalisé non configuré

3. **Fichiers commençant par point ignorés**
   - **Cause**: `.nojekyll` manquant
   - **Impact**: GitHub Pages utilise Jekyll par défaut (ignore certains fichiers)

## ✅ Solutions Appliquées

### 1. Fichiers Markdown Manquants

```bash
# Copier depuis racine vers docs/
cp index.fr.md index.en.md docs/
```

**Fichiers ajoutés**:
- `docs/index.fr.md` (4.3 KB) - Contenu français
- `docs/index.en.md` (4.1 KB) - Contenu anglais

### 2. Configuration Domaine Personnalisé

```bash
# Créer CNAME
echo "ontowave.org" > docs/CNAME
```

**Fichier ajouté**:
- `docs/CNAME` - Configure `ontowave.org` comme domaine principal

### 3. Désactivation Jekyll

```bash
# Créer .nojekyll
touch docs/.nojekyll
```

**Fichier ajouté**:
- `docs/.nojekyll` - Désactive processing Jekyll, sert tous fichiers bruts

## �� Commit

```
fix: Ajouter fichiers critiques pour GitHub Pages

- Copier index.fr.md et index.en.md dans docs/ (contenu site)
- Créer CNAME avec ontowave.org (domaine personnalisé)
- Créer .nojekyll (désactiver Jekyll, servir tous fichiers)

Fixes:
- https://stephanedenis.github.io/OntoWave/#index.fr.md 404 → OK
- https://ontowave.org/ 404 → OK (après propagation DNS)
```

**SHA**: 98222f0

## ⏳ Délai de Propagation

- **GitHub Pages**: 1-5 minutes (déploiement automatique)
- **DNS ontowave.org**: 5-10 minutes (cache CDN GitHub)

## ✅ Vérification

Après propagation (5-10 min):

```bash
# Test GitHub Pages
curl -I https://stephanedenis.github.io/OntoWave/index.fr.md
# Attendu: HTTP/2 200

# Test domaine personnalisé
curl -I https://ontowave.org/
# Attendu: HTTP/2 200

# Test contenu
curl -s https://ontowave.org/ | grep "ontowave"
# Attendu: <div id="ontowave"> créé dynamiquement par JS
```

## 📝 Notes Importantes

### ⚠️ Ne PAS Ajouter Manuellement `<div id="ontowave">`

OntoWave crée automatiquement cet élément via JavaScript:

```javascript
// src/index.ts - Initialisation automatique
const app = document.getElementById('ontowave') || 
            document.body.appendChild(document.createElement('div'))
app.id = 'ontowave'
```

**Ajouter manuellement créerait une régression!**

### ✅ Structure Correcte

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <!-- Configuration AVANT script -->
    <script>
        window.ontoWaveConfig = { ... };
    </script>
    
    <!-- Script OntoWave -->
    <script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
    
    <!-- OntoWave crée automatiquement <div id="ontowave"> ici -->
</body>
</html>
```

## 🎯 État Actuel

- ✅ Fichiers Markdown dans `docs/`
- ✅ CNAME configuré
- ✅ .nojekyll créé
- ✅ Commit + push vers `main`
- ⏳ Attente déploiement GitHub Pages (1-5 min)
- ⏳ Attente propagation DNS (5-10 min)

## 📊 Fichiers GitHub Pages

```
docs/
├── .nojekyll              ← Désactive Jekyll
├── CNAME                  ← ontowave.org
├── index.html             ← Page principale
├── index.fr.md            ← Contenu français ✅
├── index.en.md            ← Contenu anglais ✅
├── ontowave.js            ← Bundle non-minifié
├── ontowave.min.js        ← Bundle minifié (81 KB)
└── demos/                 ← Démos Playwright
```

