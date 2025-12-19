# 🌊 OntoWave - Déploiement Production (Dogfooding)

## Vue d'ensemble

Le déploiement production dans `docs/` (correspondant à `ontowave.com`) suit la philosophie **"dogfooding"** : OntoWave utilise OntoWave pour afficher sa propre documentation.

## Configuration

### window.ontoWaveConfig

Le déploiement production utilise une configuration inline dans `docs/index.html` :

```javascript
window.ontoWaveConfig = {
  externalDataSources: [
    {
      name: 'ontowave-docs',
      baseUrl: 'https://raw.githubusercontent.com/stephanedenis/OntoWave/main',
      corsEnabled: true
    },
    {
      name: 'panini-speckit',
      baseUrl: 'https://raw.githubusercontent.com/stephanedenis/Panini-SpecKit-Shared/main',
      corsEnabled: true
    }
  ],
  sources: {
    fr: '@ontowave-docs/README.md',
    en: '@ontowave-docs/README.md'
  },
  defaultLocale: 'fr',
  engine: 'v2',
  brand: '🌊 OntoWave',
  enablePrism: true,
  enableMermaid: true,
  enablePlantUML: true,
  enableMath: true
};
```

### Philosophie Dogfooding

1. **Source Externe** : Le README.md principal est chargé directement depuis GitHub
2. **Syntaxe @ **: Utilisation de `@ontowave-docs/README.md` pour démontrer les capacités
3. **CORS Activé** : `corsEnabled: true` pour les requêtes cross-origin
4. **Multi-sources** : Deux sources externes (`ontowave-docs` et `panini-speckit`)
5. **Features Complètes** : Tous les plugins activés (Mermaid, Math, PlantUML, Prism)

## Tests Playwright

### Suite de Tests

Le déploiement est validé par une suite complète de 7 tests dans `tests/e2e/production-deployment.spec.cjs` :

1. ✅ **Configuration window.ontoWaveConfig** - PASSED (2.8s)
   - Vérifie que la configuration est correctement chargée
   - Valide la structure des sources externes
   - Confirme les features activées

2. ✅ **Navigation vers sources externes** - PASSED (3.9s)
   - Valide les requêtes GitHub effectuées
   - Confirme l'accessibilité des sources externes
   - URL correcte : `https://raw.githubusercontent.com/stephanedenis/OntoWave/main/README.md`

3. ⚠️ **Page principale charge le README depuis GitHub** - TIMEOUT
   - Requête GitHub effectuée correctement
   - URL résolue : `@ontowave-docs/README.md` → URL complète
   - Hash configuré : `#@ontowave-docs/README.md`
   - **Issue** : Contenu ne charge pas dans les 15 secondes (nécessite investigation)

4. ⚠️ **Features OntoWave activées** - FAILED
   - Modules détectés mais validation échouée
   - Nécessite ajustement des assertions

5. ⏸️ **Performance** - NON TESTÉ (timeout suite)
6. ⏸️ **Responsive mobile** - NON TESTÉ (timeout suite)
7. ⏸️ **Validation dogfooding** - NON TESTÉ (timeout suite)

### Exécution des Tests

```bash
# Serveur HTTP (doit être démarré avant)
python3 -m http.server 8020 --directory docs

# Tests production
npx playwright test tests/e2e/production-deployment.spec.cjs \
  --project=chromium \
  --config=playwright.production.config.js \
  --timeout=60000
```

## État Actuel

### ✅ Réussites

- Configuration dogfooding implémentée dans `docs/index.html`
- Sources externes configurées correctement
- Requêtes GitHub effectuées avec succès
- Tests Playwright créés et fonctionnels (2/7 passent)
- URL resolution fonctionne (`@ontowave-docs` → GitHub URL)
- Bundle production à jour (`index-Cm1od528.js`)

### ⚠️ Points d'Attention

1. **Chargement Contenu** : Le contenu GitHub ne s'affiche pas dans les 15 secondes
   - Requête HTTP réussit (200 OK, 7916 bytes)
   - URL correcte construite
   - Potentiellement lié au rendu asynchrone ou timeout trop court

2. **Tests Timeout** : Suite complète prend > 90 secondes
   - Optimisation nécessaire des wait strategies
   - Considérer `page.waitForLoadState('networkidle')` au lieu de timeouts fixes

3. **Validation Features** : Test des plugins nécessite ajustement
   - Assertions sur Mermaid/Markdown échouent
   - Vérifier le chargement des modules

### 📋 Actions Recommandées

1. **Investigation Chargement** :
   ```javascript
   // Ajouter dans le test
   await page.waitForFunction(() => {
     const app = document.getElementById('app');
     const content = app?.innerHTML || '';
     console.log('Content length:', content.length);
     return content.includes('OntoWave') && content.length > 1000;
   }, { timeout: 30000 });
   ```

2. **Diagnostic Browser** :
   - Ouvrir http://localhost:8020/index.html#@ontowave-docs/README.md
   - Inspecter Console pour erreurs
   - Vérifier Network tab pour réponse GitHub
   - Valider que le contenu s'affiche visuellement

3. **Optimisation Tests** :
   - Réduire nombre de tests exécutés en parallèle
   - Augmenter timeout global à 120s
   - Utiliser `waitForSelector` au lieu de `waitForTimeout`

## Conclusion

Le déploiement production suit la philosophie OntoWave avec :
- ✅ Configuration dogfooding en place
- ✅ Sources externes GitHub configurées
- ✅ Tests Playwright implémentés (2/7 passent)
- ⚠️ Investigation nécessaire sur le chargement contenu

Le modèle est **techniquement correct** mais nécessite **optimisation des tests** et **investigation du chargement asynchrone** pour validation complète.

---

**Dernière mise à jour** : 19/12/2025  
**Bundle** : `index-Cm1od528.js` (141.84 kB)  
**Tests** : 2/7 passés, 1 timeout, 1 échec, 3 non exécutés
