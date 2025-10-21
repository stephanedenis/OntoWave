# 📦 Guide de Publication NPM - OntoWave

## Publication Automatique (Recommandée)

### Quand un PR est mergé :
1. **Automatique** : Le workflow `.github/workflows/npm-publish.yml` se déclenche
2. **Auto-bump** : Version patch automatique (ex: `1.0.0` → `1.0.1`)
3. **Build & Publish** : Construction et publication automatique sur NPM
4. **Git Tags** : Création automatique du tag de version

### Pour une version spécifique :
```bash
# Créer un tag de version
git tag v1.1.0
git push origin v1.1.0

# Le workflow publiera automatiquement cette version
```

## Publication Manuelle (Fallback)

### Prérequis :
```bash
# Se connecter à NPM
npm login

# Vérifier l'accès
npm whoami
```

### Processus manuel :
```bash
# Script tout-en-un
npm run publish:npm

# OU étape par étape :
npm run build:package    # Build + minification
npm version patch        # Bump version
npm publish              # Publication NPM
```

## Configuration GitHub Actions

### Secrets requis :
- `NPM_TOKEN` : Token d'authentification NPM
  1. Aller sur [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
  2. Créer un "Automation Token"
  3. Ajouter dans GitHub Settings > Secrets > Actions

### Déclencheurs automatiques :
- ✅ PR mergé sur `main` → version patch
- ✅ Push tag `v*` → version spécifique
- ✅ Push direct sur `main` → version patch

## Versions & Stratégie

### Semantic Versioning :
- `patch` (1.0.0 → 1.0.1) : Bugfixes, petites améliorations
- `minor` (1.0.0 → 1.1.0) : Nouvelles fonctionnalités
- `major` (1.0.0 → 2.0.0) : Breaking changes

### Exemples de commandes :
```bash
npm version patch    # 1.0.0 → 1.0.1 (fix alignements tableaux)
npm version minor    # 1.0.0 → 1.1.0 (nouvelle fonctionnalité)
npm version major    # 1.0.0 → 2.0.0 (breaking change)
```

## Verification Post-Publication

### Vérifier sur NPM :
```bash
npm view ontowave
npm info ontowave versions --json
```

### Tester l'installation :
```bash
npm install ontowave@latest
```

### CDN Links :
- **jsDelivr** : `https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js`
- **unpkg** : `https://unpkg.com/ontowave@latest/dist/ontowave.min.js`

## Rollback en cas de problème

```bash
# Dépublier une version (dans les 72h)
npm unpublish ontowave@1.0.1

# Ou deprecate (préférable)
npm deprecate ontowave@1.0.1 "Version avec problème d'alignement"
```

---

✅ **Résumé** : Mergez votre PR et la publication NPM se fera automatiquement !