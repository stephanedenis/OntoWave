# OntoWave - Règles de Développement

## 🌊 À propos d'OntoWave

OntoWave est un moteur de rendu markdown moderne et minimaliste conçu pour la simplicité d'usage et l'excellence visuelle.

## 🌿 Règles de Développement Spécifiques

### 1. Gestion des Branches - OBLIGATOIRE

**Chaque modification doit être faite dans une branche dédiée :**

```bash
# Pour un bug fix
git checkout -b fix/ontowave-tableaux
git checkout -b fix/markdown-rendering

# Pour une feature
git checkout -b feature/dark-mode
git checkout -b feature/export-pdf

# Pour documentation
git checkout -b docs/api-reference
```

### 2. Tests avec Playwright - OBLIGATOIRE

**Règle absolue : Playwright uniquement, jamais Selenium ou navigateur VS Code**

```bash
# Tests dans tests/e2e/
npx playwright test tests/e2e/fix-tableaux.spec.js
npx playwright test tests/e2e/feature-export.spec.js
```

### 3. Captures d'Écran pour Impact Visuel - OBLIGATOIRE

**Tout PR avec impact visuel DOIT inclure une capture d'écran**

#### Impacts visuels concernés :
- ✅ Modifications CSS/styles
- ✅ Nouveau rendu markdown  
- ✅ Corrections d'affichage
- ✅ Thèmes et couleurs
- ✅ Layout et responsive
- ✅ Typographie

#### Génération automatique :
```javascript
// Exemple test avec capture
test('validation fix tableaux OntoWave', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.screenshot({
    path: 'VALIDATION-FIX-TABLEAUX-ONTOWAVE.png',
    fullPage: true
  });
});
```

## 🔧 Workflow OntoWave

### Étape 1 : Création Issue + Branche
```bash
# 1. Créer issue sur GitHub
# 2. Créer branche dédiée
git checkout main
git pull origin main  
git checkout -b fix/description-probleme
```

### Étape 2 : Développement
```bash
# Modifier src/adapters/browser/md.ts ou autres fichiers
# Maintenir la simplicité d'OntoWave
npm run build:standalone  # Vérifier que le build fonctionne
```

### Étape 3 : Tests (OBLIGATOIRE)
```bash
# Tests Playwright uniquement
npx playwright test tests/e2e/

# Pour impact visuel, générer capture
npx playwright test tests/e2e/capture-fix.spec.js
```

### Étape 4 : Validation Visuelle
```bash
# Servir les assets pour tests
python3 -m http.server 8080 --directory docs &

# Vérifier rendu dans navigateur
# Prendre capture d'écran si impact visuel
```

### Étape 5 : PR avec Preuves
```bash
git add .
git commit -m "fix: description avec capture jointe"
git push origin fix/description-probleme

# Créer PR avec :
# - Template GitHub
# - Capture d'écran obligatoire si impact visuel
# - Tests Playwright validés
```

## 📸 Exemples de Captures Requises

### Fix Tableaux OntoWave ✅
```markdown
## 📸 Preuves Visuelles

### Résultat Final
![Validation](VALIDATION-FIX-TABLEAUX-ONTOWAVE.png)

### Changements
- ✅ Bordures de tableaux appliquées
- ✅ Headers en gras
- ✅ Zebra striping fonctionnel
- ✅ Responsive design
```

### Feature Dark Mode ✅  
```markdown
## 📸 Preuves Visuelles

### Mode Clair
![Mode Clair](VALIDATION-LIGHT-MODE.png)

### Mode Sombre  
![Mode Sombre](VALIDATION-DARK-MODE.png)
```

## ❌ Exemples de PR Refusés

### Sans Branche Dédiée
```
❌ PR depuis main directement
❌ Multiples issues dans une branche
❌ Convention de nommage non respectée
```

### Impact Visuel Sans Capture
```
❌ Modification CSS sans capture
❌ Nouveau composant sans validation visuelle
❌ Fix d'affichage sans preuve
```

### Tests Non-Playwright
```
❌ Tests Selenium
❌ Tests navigateur VS Code
❌ Tests manuels uniquement
```

## 🚀 Scripts d'Aide

### Vérification des Règles
```bash
# Depuis la racine du projet
./check-rules.sh

# Créer branche selon règles
./check-rules.sh branch

# Exécuter tests Playwright
./check-rules.sh test

# Générer template PR
./check-rules.sh template
```

### Build et Test OntoWave
```bash
cd projects/ontowave

# Build
npm run build:standalone

# Tests
npx playwright test tests/e2e/

# Serveur pour tests
python3 -m http.server 8080 --directory docs &
```

## 📋 Template PR OntoWave

```markdown
## 📋 Description
Fix rendering des tableaux dans OntoWave

## 🏷️ Type de changement  
- [x] 🐛 Bug fix
- [x] 🎨 **Impact visuel**

## 📸 Preuves Visuelles
![Validation](VALIDATION-FIX-TABLEAUX-ONTOWAVE.png)

### Changements visuels
- ✅ Tables avec bordures appropriées
- ✅ Headers stylisés en gras
- ✅ Zebra striping pour lisibilité

## 🧪 Tests
- [x] Tests Playwright passent
- [x] Capture automatisée générée
- [x] Build OntoWave fonctionnel

## ✅ Checklist
- [x] Branche dédiée (fix/ontowave-tableaux)
- [x] Convention respectée  
- [x] Capture d'écran jointe
- [x] Simplicité OntoWave préservée

Closes #123
```

## 🚨 Rappels Critiques

1. **Une branche par issue** - Pas d'exception
2. **Playwright uniquement** - Jamais Selenium/VS Code browser  
3. **Capture obligatoire** - Pour tout impact visuel
4. **Simplicité OntoWave** - Ne pas complexifier l'API
5. **Build fonctionnel** - Toujours vérifier npm run build:standalone

---

**Ces règles sont en vigueur pour tous les contributeurs OntoWave**