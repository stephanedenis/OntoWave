# 🚀 Configuration GitHub Pages pour OntoWave

## 📋 Configuration actuelle

### ✅ Déploiement automatique
- **Workflow GitHub Actions** : `.github/workflows/pages.yml`
- **Déclencheurs** : Push vers `main` et Pull Requests
- **Build automatique** : `npm run build` → déploiement du dossier `docs/`

### 🌐 Domaine personnalisé
- **CNAME configuré** : `ontowave.com`
- **Fichier** : `docs/CNAME`

### 📁 Structure de déploiement
```
docs/                          # Racine du site GitHub Pages
├── index.html                # Page d'accueil principale
├── ontowave.min.js           # Bibliothèque minifiée
├── CNAME                     # Configuration domaine personnalisé
├── _config.yml              # Configuration Jekyll
├── .nojekyll                # Désactivation Jekyll par défaut
├── 01-minimal.html          # Démos
├── 02-basic-config.html     # 
├── 03-dark-theme.html       # 
├── 04-advanced-config.html  # 
├── 05-mkdocs-style.html     # 
├── assets/                  # Ressources statiques
├── demo/                    # Démos supplémentaires
└── ...                      # Autres fichiers de documentation
```

## 🔧 Actions à effectuer sur GitHub

### 1. Activer GitHub Pages
1. Aller sur `https://github.com/stephanedenis/OntoWave/settings/pages`
2. **Source** : Sélectionner "GitHub Actions"
3. **Custom domain** : Vérifier que `ontowave.com` est configuré
4. **Enforce HTTPS** : Activer

### 2. Configuration DNS (côté domaine)
Pour `ontowave.com`, configurer les enregistrements DNS :
```
Type: CNAME
Name: www
Value: stephanedenis.github.io

Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 3. Vérification du déploiement
Après activation, le site sera disponible à :
- **URL GitHub** : `https://stephanedenis.github.io/OntoWave/`
- **Domaine personnalisé** : `https://ontowave.com/`

## 📊 Monitoring
- **Status du déploiement** : Onglet "Actions" du repository
- **Logs de build** : Détails dans chaque exécution du workflow
- **Tests automatiques** : Les tests E2E sont exécutés avant déploiement

## 🔄 Processus de mise à jour
1. **Push vers main** → Déclenchement automatique du workflow
2. **Build du projet** → `npm run build`
3. **Déploiement** → Mise en ligne automatique

Le site sera mis à jour automatiquement à chaque commit sur la branche `main`.
