# Issue 1: Reconsidérer la galerie d'exemples locale

## 📋 Description

La galerie d'exemples actuelle (`docs/gallery.html`) fait partie intégrante de l'application et pose plusieurs questions :

1. **Pertinence** : Est-ce que cette galerie fait vraiment partie de l'application OntoWave ou devrait-elle être externalisée ?
2. **Maintenance** : Les exemples locaux nécessitent une maintenance constante
3. **Cohérence** : Les exemples pourraient être mieux centralisés

## 💡 Proposition

Remplacer la galerie locale par des liens vers des exemples hébergés sur **ontowave.com** (quand disponible) :

- Réduire la taille du package
- Centraliser les exemples sur le site officiel
- Faciliter la maintenance et les mises à jour
- Permettre des exemples plus riches et interactifs

## 🔄 Actions proposées

1. **Phase 1** : Identifier les exemples essentiels à conserver localement
2. **Phase 2** : Préparer les exemples pour ontowave.com
3. **Phase 3** : Remplacer la galerie locale par des liens externes
4. **Phase 4** : Nettoyer les fichiers d'exemples obsolètes

## 📁 Fichiers concernés

- `docs/gallery.html` (389 lignes)
- `docs/01-minimal.html`
- `docs/02-basic-config.html`
- `docs/03-dark-theme.html`
- `docs/04-advanced-config.html`
- `docs/05-mkdocs-style.html`
- Références dans `docs/index.md`

## 🎯 Bénéfices attendus

- **Réduction de la taille** du repository
- **Simplification** de la maintenance
- **Centralisation** des exemples
- **Meilleure expérience** utilisateur avec des exemples toujours à jour

## ⏰ Priorité

Moyenne - À planifier après la mise en place d'ontowave.com
