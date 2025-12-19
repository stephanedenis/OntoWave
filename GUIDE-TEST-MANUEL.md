# 🧪 Guide de Test Manuel - Validation Avant Merge

Ce document décrit les tests manuels à effectuer pour garantir qu'il n'y a pas de régression avant de merger la branche `feature/plugin-architecture-19` vers `main`.

## 🤖 Tests Automatisés

### Exécution complète

```bash
# Exécuter tous les tests automatisés
./test-complete-regression.sh
```

Ce script exécute :
1. ✅ Tests unitaires Vitest (7 tests de protection docs/)
2. ✅ Type checking TypeScript
3. ✅ Linting ESLint
4. ✅ Spell checking
5. ✅ Build Vite
6. ✅ Vérification structure docs/
7. ✅ Tests E2E Playwright

### Tests individuels

```bash
# Tests unitaires seulement
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Tests E2E
npm run test:e2e
```

## 🖱️ Tests Manuels Requis

### 1. Test Local du Site (docs/)

#### Démarrer le serveur
```bash
npm run serve:docs
# Ou: python3 -m http.server 8080 --directory docs
```

#### Vérifications

**Page d'accueil** : http://127.0.0.1:8080

- [ ] La page se charge correctement
- [ ] Le menu s'affiche
- [ ] Les boutons de langue fonctionnent (FR/EN)
- [ ] Le contenu Markdown s'affiche
- [ ] La coloration syntaxique Prism fonctionne
- [ ] Les diagrammes Mermaid s'affichent
- [ ] La configuration dogfooding est active (sources externes GitHub)

**Release Notes** : http://127.0.0.1:8080/release-notes.md

- [ ] La page release notes se charge
- [ ] L'historique des versions s'affiche
- [ ] Les liens CDN sont actifs et cliquables
- [ ] Le formatage est correct (titres, listes, tableaux)
- [ ] Les émojis s'affichent correctement
- [ ] Navigation fonctionne vers autres pages

**Release Notes FR** : http://127.0.0.1:8080/release-notes.fr.md

- [ ] Version française se charge
- [ ] Contenu traduit correctement
- [ ] Tableaux et structure identiques

**Release Notes EN** : http://127.0.0.1:8080/release-notes.en.md

- [ ] Version anglaise se charge
- [ ] Contenu en anglais
- [ ] Détails complets présents

### 2. Test Navigation

#### Navigation principale

- [ ] Bouton Home fonctionne (issue #24 corrigée)
- [ ] Navigation entre pages fonctionne
- [ ] Liens externes s'ouvrent dans nouvel onglet
- [ ] Retour arrière fonctionne
- [ ] URLs sont propres (pas de double slashes)

#### Navigation release notes

Depuis l'interface OntoWave :
- [ ] Lien "📋 Release Notes" visible dans la navigation
- [ ] Clic sur le lien charge la page release notes
- [ ] Liens vers Roadmap, NPM, GitHub fonctionnent

### 3. Test Responsive

- [ ] Desktop (1920x1080) : Affichage correct
- [ ] Tablet (768x1024) : Adaptation correcte
- [ ] Mobile (375x667) : Menu mobile fonctionne

### 4. Test Multi-navigateurs

- [ ] **Chrome/Chromium** : Tout fonctionne
- [ ] **Firefox** : Tout fonctionne
- [ ] **Safari** (si disponible) : Tout fonctionne
- [ ] **Edge** : Tout fonctionne

### 5. Test Performance

- [ ] Temps de chargement initial < 2s
- [ ] Pas de freezes lors de la navigation
- [ ] Diagrammes se rendent rapidement
- [ ] Pas d'erreurs console JavaScript

### 6. Test Liens CDN

Vérifier que les liens CDN dans release notes fonctionnent :

#### unpkg
```bash
curl -I https://unpkg.com/ontowave@1.0.24/dist/ontowave.min.js
# Doit retourner 200 OK
```

#### jsDelivr
```bash
curl -I https://cdn.jsdelivr.net/npm/ontowave@1.0.24/dist/ontowave.min.js
# Doit retourner 200 OK
```

#### Test dans navigateur

Copier ce code dans un fichier HTML et ouvrir dans le navigateur :

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test CDN OntoWave</title>
</head>
<body>
  <h1>Test CDN Links</h1>
  <div id="test-unpkg"></div>
  <div id="test-jsdelivr"></div>
  
  <script src="https://unpkg.com/ontowave@1.0.24/dist/ontowave.min.js"></script>
  <script>
    document.getElementById('test-unpkg').textContent = 
      typeof window.OntoWave !== 'undefined' ? '✅ unpkg OK' : '❌ unpkg FAIL';
  </script>
  
  <script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.24/dist/ontowave.min.js"></script>
  <script>
    document.getElementById('test-jsdelivr').textContent = 
      typeof window.OntoWave !== 'undefined' ? '✅ jsDelivr OK' : '❌ jsDelivr FAIL';
  </script>
</body>
</html>
```

### 7. Test Configuration Dogfooding

Vérifier dans `docs/index.html` :

- [ ] `window.ontoWaveConfig` est défini
- [ ] `externalDataSources` contient ontowave-docs
- [ ] `sources` pointe vers @ontowave-docs/README.md
- [ ] `navigation.links` contient lien release notes

### 8. Test Build Output

```bash
npm run build
```

Vérifications :

- [ ] Build se termine sans erreur
- [ ] Dossier `public-demo/` créé (PAS docs/)
- [ ] Fichier `public-demo/index.html` existe
- [ ] Dossier `docs/` est intact (non effacé)
- [ ] Fichier `docs/ontowave.min.js` toujours présent

### 9. Test Protection Régression

Exécuter les tests de protection :

```bash
npm run test
```

Vérifier que tous les 7 tests passent :

1. ✅ docs/ contient index.html
2. ✅ docs/index.html a configuration dogfooding
3. ✅ vite.config.ts ne pointe PAS vers docs/
4. ✅ vite.config.ts pointe vers public-demo/
5. ✅ docs/ontowave.min.js existe
6. ✅ .gitignore contient public-demo/
7. ✅ docs/ n'est PAS dans .gitignore

### 10. Test Accessibilité

Dans le navigateur (DevTools > Lighthouse) :

- [ ] Score Accessibilité > 90
- [ ] Pas d'erreurs WCAG critiques
- [ ] Contraste des couleurs acceptable
- [ ] Navigation clavier fonctionne

## 📋 Checklist Finale Avant Merge

### Code Quality

- [ ] Tous les tests automatisés passent (7/7)
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur ESLint
- [ ] Build réussit sans warnings

### Fonctionnalités

- [ ] Page release notes accessible et fonctionnelle
- [ ] Navigation fonctionne (bouton Home corrigé)
- [ ] Configuration dogfooding active
- [ ] Liens CDN valides pour toutes versions

### Documentation

- [ ] README.md à jour
- [ ] Release notes complètes (v1.0.1 - v1.0.24)
- [ ] Guide de maintenance créé
- [ ] Documentation technique à jour

### Protection

- [ ] docs/ n'est pas effacé lors du build
- [ ] vite.config.ts pointe vers public-demo/
- [ ] .gitignore correct
- [ ] Tests de protection en place

### Performance

- [ ] Site charge en < 2s
- [ ] Pas de freezes
- [ ] Console sans erreurs critiques

## 🚀 Commandes de Merge

Une fois tous les tests validés :

### Option 1 : Merge direct

```bash
# Basculer sur main
git checkout main

# Merge la feature branch
git merge feature/plugin-architecture-19

# Push vers GitHub
git push origin main
```

### Option 2 : Pull Request

```bash
# Créer une PR via GitHub CLI
gh pr create \
  --title "feat: Release notes et historique versions" \
  --body "## Changements
  
- Ajout page release notes complète
- 24 versions documentées (v1.0.1 - v1.0.24)
- Liens CDN complets (unpkg + jsDelivr)
- Navigation intégrée
- Support multilingue (FR/EN)
- Documentation de maintenance

## Tests
- ✅ 7/7 tests de protection passent
- ✅ Build réussit
- ✅ Site fonctionne localement
- ✅ Liens CDN valides

## Validation
- [x] Tests automatisés
- [x] Tests manuels
- [x] Documentation complète
- [x] Pas de régression"
```

## 📊 Résultats Attendus

### Tests Automatisés
```
✅ Tests unitaires (7/7)
✅ Type checking
✅ Linting
✅ Build
✅ Structure docs/
✅ Tests E2E
```

### Tests Manuels
```
✅ Site local fonctionne
✅ Release notes accessibles
✅ Navigation correcte
✅ Liens CDN valides
✅ Pas de régression
```

## ⚠️ En Cas de Problème

### Erreur de build
```bash
# Nettoyer et rebuilder
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests E2E échouent
```bash
# Vérifier que le serveur est démarré
lsof -i :8080

# Relancer les tests avec debug
npm run test:e2e:debug
```

### docs/ effacé
```bash
# Restaurer depuis git
git restore docs/

# Vérifier vite.config.ts
cat vite.config.ts | grep outDir
# Doit afficher: outDir: 'public-demo'
```

## 📝 Notes

- **Durée estimée tests complets** : 10-15 minutes
- **Tests critiques** : Tests automatisés + Site local + Release notes
- **Tests optionnels** : Multi-navigateurs + Accessibilité
- **Prérequis** : Node.js, npm, navigateur moderne

---

**Dernière mise à jour** : 19 décembre 2025  
**Version testée** : feature/plugin-architecture-19  
**Statut** : ✅ Prêt pour validation
