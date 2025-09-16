# Guide de publication OntoWave

Ce guide explique comment publier OntoWave sur NPM pour le rendre disponible via les CDN.

## Prérequis

1. **Compte NPM** configuré localement :
   ```bash
   npm login
   ```

2. **Branche main** à jour et propre :
   ```bash
   git status  # Doit être clean
   git pull origin main
   ```

## Publication automatisée

### 1. Utiliser le script de publication

```bash
npm run publish:npm
```

Le script vous guidera à travers :
- Construction de la version minifiée
- Choix du type de version (patch/minor/major/prerelease)
- Test de publication (dry-run)
- Publication réelle après confirmation

### 2. Types de versions

- **patch** (1.0.0 → 1.0.1) : Corrections de bugs
- **minor** (1.0.0 → 1.1.0) : Nouvelles fonctionnalités
- **major** (1.0.0 → 2.0.0) : Breaking changes
- **prerelease** (1.0.0 → 1.0.1-0) : Version de test

## Publication manuelle

Si vous préférez le contrôle manuel :

### 1. Construire le package
```bash
npm run build:package
cp dist/ontowave.min.js docs/ontowave.min.js
```

### 2. Mettre à jour la version
```bash
npm version patch  # ou minor/major
```

### 3. Publier
```bash
npm publish --access public
git push origin main
git push origin --tags
```

## Après publication

Une fois publié, le package sera automatiquement disponible sur :

### CDN JSDelivr
```html
<!-- Version spécifique -->
<script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.0/dist/ontowave.min.js"></script>

<!-- Dernière version -->
<script src="https://cdn.jsdelivr.net/npm/ontowave/dist/ontowave.min.js"></script>
```

### CDN Unpkg
```html
<!-- Version spécifique -->
<script src="https://unpkg.com/ontowave@1.0.0/dist/ontowave.min.js"></script>

<!-- Dernière version -->
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

### Installation NPM
```bash
npm install ontowave
```

## Vérification

Après publication, vérifiez :

1. **Page NPM** : https://www.npmjs.com/package/ontowave
2. **CDN JSDelivr** : https://cdn.jsdelivr.net/npm/ontowave/
3. **CDN Unpkg** : https://unpkg.com/ontowave/

## Rollback

En cas de problème :

```bash
# Annuler le dernier commit de version (avant push)
git reset HEAD~1
git tag -d v1.0.1

# Dépublier une version NPM (dans les 72h)
npm unpublish ontowave@1.0.1
```

## Notes importantes

- ⚠️ **Versions NPM définitives** : Une fois publiée, une version ne peut plus être modifiée
- 🔒 **Unpublish limité** : Seulement possible dans les 72h et si aucune dépendance
- 📦 **Fichiers inclus** : Seuls `dist/`, `README.md`, `LICENSE` sont publiés
- 🌐 **Propagation CDN** : Peut prendre quelques minutes pour être disponible
