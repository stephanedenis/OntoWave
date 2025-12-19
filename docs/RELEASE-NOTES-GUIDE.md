# 📋 Documentation OntoWave - Release Notes & Version History

## Vue d'ensemble

Ce document décrit l'ajout du système de release notes et d'historique des versions pour ontowave.org.

## 🎯 Objectif

Fournir aux utilisateurs d'OntoWave :
- Un accès transparent à l'historique complet des versions (v1.0.1 - v1.0.24)
- Des liens CDN directs pour chaque version (unpkg et jsDelivr)
- Une documentation claire des changements et améliorations
- Une feuille de route visible pour les futures versions

## 📁 Fichiers créés

### Release Notes

1. **[docs/release-notes.md](./release-notes.md)** - Version principale (anglais par défaut)
2. **[docs/release-notes.fr.md](./release-notes.fr.md)** - Version française complète
3. **[docs/release-notes.en.md](./release-notes.en.md)** - Version anglaise complète

### Structure des release notes

Chaque fichier de release notes contient :

#### 📦 Section CDN Links
- Liens vers `@latest` pour production
- Exemples d'utilisation pour versions spécifiques
- Support unpkg et jsDelivr

#### 🎯 Version History
Historique détaillé de toutes les versions :
- **v1.0.24** (25 oct 2025) - Fix bouton Home en mode routing
- **v1.0.23** (22 oct 2025) - Protection fichiers GitHub Pages
- **v1.0.22** (22 oct 2025) - Fichiers critiques pour déploiement
- **v1.0.20-21** - Maintenance et optimisations
- **v1.0.10-19** - Évolution continue et stabilité
- **v1.0.1-9** - Premières releases et stabilisation

#### 🔮 Roadmap
- **v1.1.0** (Déc 2025) - Performance & UX
- **v1.2.0** (Mars 2026) - Extensibilité
- **v2.0.0** (Sept 2026) - Architecture Next-Gen

#### 🔍 Version Selector
- Recommandations d'utilisation par cas d'usage
- Guide de migration entre versions
- Tableau de compatibilité (Node.js, navigateurs, TypeScript)
- Politique de support

## 🔗 Intégration dans le site

### Configuration OntoWave

Le fichier [docs/index.html](./index.html) a été mis à jour avec :

```javascript
// Navigation additionnelle
navigation: {
  links: [
    { label: '📋 Release Notes', url: '/release-notes.md' },
    { label: '🗺️ Roadmap', url: '/ROADMAP.md' },
    { label: '📦 NPM', url: 'https://www.npmjs.com/package/ontowave', external: true },
    { label: '🐙 GitHub', url: 'https://github.com/stephanedenis/OntoWave', external: true }
  ]
}
```

### Accès aux release notes

Les utilisateurs peuvent accéder aux release notes via :
1. **Navigation principale** : Lien direct dans l'interface OntoWave
2. **URL directe** : https://ontowave.org/release-notes.md
3. **Version française** : https://ontowave.org/release-notes.fr.md
4. **Version anglaise** : https://ontowave.org/release-notes.en.md

## 📊 Liens CDN fournis

### Unpkg

```html
<!-- Latest -->
<script src="https://unpkg.com/ontowave@latest/dist/ontowave.min.js"></script>

<!-- Version spécifique -->
<script src="https://unpkg.com/ontowave@1.0.24/dist/ontowave.min.js"></script>
```

### jsDelivr

```html
<!-- Latest -->
<script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>

<!-- Version spécifique -->
<script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.24/dist/ontowave.min.js"></script>
```

## 📈 Statistiques des versions

- **Total de versions** : 24 versions production (v1.0.1 - v1.0.24)
- **Période couverte** : 2024 - 2025
- **Fréquence de release** : Régulière avec corrections et améliorations progressives
- **Version actuelle développement** : v1.0.0 (package.json)

## 🎨 Contenu des release notes

### Informations par version

Chaque version documentée inclut :
- ✅ **Numéro de version** et date de release
- ✅ **Description des changements** (fixes, features, maintenance)
- ✅ **Liens CDN** : unpkg + jsDelivr
- ✅ **Issues GitHub** référencées (quand applicable)

### Sections additionnelles

Les release notes incluent également :
- 📚 **Documentation** : Liens vers guides et API
- 🔍 **Version Selector** : Recommandations par cas d'usage
- 📄 **Licence** : CC-BY-NC-SA-4.0
- 💬 **Support** : GitHub Issues et Discussions
- 🎉 **Remerciements** : Communauté et contributeurs

## 🚀 Prochaines étapes

### Maintenance continue

1. **Mise à jour régulière** : Ajouter chaque nouvelle version
2. **Validation des liens CDN** : Vérifier disponibilité
3. **Documentation des breaking changes** : Pour futures releases majeures
4. **Feedback utilisateurs** : Améliorer format selon retours

### Améliorations futures

- [ ] Générateur automatique de release notes depuis git tags
- [ ] API pour interroger l'historique des versions
- [ ] Widget de sélection de version intégré dans OntoWave
- [ ] Changelog détaillé au format Keep a Changelog
- [ ] Badges de statut pour chaque version

## 📝 Workflow de mise à jour

### Lors d'une nouvelle release

1. **Créer le tag git** : `git tag v1.0.x`
2. **Publier sur NPM** : Via workflow automatisé
3. **Mettre à jour release notes** :
   - Ajouter nouvelle section en haut
   - Indiquer date et changements
   - Ajouter liens CDN
4. **Valider sur CDN** : Vérifier disponibilité unpkg + jsDelivr
5. **Annoncer** : GitHub Discussions + README

### Template de section de version

```markdown
### vX.Y.Z (Date)

**🐛 Corrections** / **✨ Fonctionnalités** / **🛠️ Maintenance**
- ✅ Description du changement 1
- ✅ Description du changement 2

**📦 CDN**
- [unpkg vX.Y.Z](https://unpkg.com/ontowave@X.Y.Z/dist/ontowave.min.js)
- [jsDelivr vX.Y.Z](https://cdn.jsdelivr.net/npm/ontowave@X.Y.Z/dist/ontowave.min.js)
```

## 🎯 Philosophie Dogfooding

Les release notes suivent la philosophie **dogfooding** d'OntoWave :
- ✅ Documentation en Markdown
- ✅ Rendu via OntoWave lui-même
- ✅ Support multilingue (FR/EN)
- ✅ Navigation intégrée
- ✅ Accessibilité et clarté

## 📦 Validation

### Checklist de validation

- [x] Fichiers release notes créés (3 versions)
- [x] Navigation ajoutée à index.html
- [x] Liens CDN vérifiés
- [x] Historique complet v1.0.1 - v1.0.24
- [x] Roadmap intégrée
- [x] Support multilingue (FR/EN)
- [x] Cohérence avec docs existantes

### Tests d'accès

```bash
# Local
curl -I http://127.0.0.1:8080/release-notes.md
curl -I http://127.0.0.1:8080/release-notes.fr.md
curl -I http://127.0.0.1:8080/release-notes.en.md

# Production
curl -I https://ontowave.org/release-notes.md
curl -I https://ontowave.org/release-notes.fr.md
curl -I https://ontowave.org/release-notes.en.md
```

## 🔗 Ressources

### Documentation associée

- [ROADMAP.md](../ROADMAP.md) - Feuille de route détaillée
- [DOGFOODING-DEPLOYMENT.md](./DOGFOODING-DEPLOYMENT.md) - Stratégie de déploiement
- [package.json](../package.json) - Version actuelle et configuration NPM

### Liens externes

- [OntoWave NPM](https://www.npmjs.com/package/ontowave)
- [OntoWave GitHub](https://github.com/stephanedenis/OntoWave)
- [unpkg CDN](https://unpkg.com/ontowave/)
- [jsDelivr CDN](https://www.jsdelivr.com/package/npm/ontowave)

---

**Créé le** : 19 décembre 2025  
**Dernière mise à jour** : 19 décembre 2025  
**Statut** : ✅ Complet et opérationnel

---

[🏠 Retour à l'accueil](/) | [📋 Release Notes](/release-notes.md) | [🗺️ Roadmap](/ROADMAP.md)
