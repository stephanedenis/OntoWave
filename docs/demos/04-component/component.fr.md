# Mode composant — createApp({ container })

OntoWave peut s'intégrer dans une application hôte existante sans prendre possession de la page entière. Le mode composant permet d'afficher de la documentation Markdown à l'intérieur d'un `<div>` ciblé.

## Usage déclaratif (recommandé)

Déclarez `container` dans votre configuration avant de charger le bundle :

```html
<script>
  window.ontoWaveConfig = {
    container: '#mon-viewer',
    roots: [{ base: '/', root: '/docs' }]
  }
</script>
<div id="mon-viewer"></div>
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

OntoWave crée son contenu **à l'intérieur de `#mon-viewer`** sans toucher au reste de la page.

## Usage programmatique

Disponible via `window.OntoWave.createApp` après chargement du bundle :

```javascript
const app = window.OntoWave.createApp({
  container: '#mon-viewer',
  roots: [{ base: '/', root: '/docs' }]
})
app.start()
```

## Contraintes et comportement

- Le menu flottant 🌊 est créé **à l'intérieur du conteneur**, pas sur le `<body>`.
- Le routage reste basé sur le hash URL (`window.location.hash`).
- Sans `container`, le comportement page-complète est conservé (rétrocompatibilité).
- L'option `ui.menu === false` masque le menu même en mode composant.

## Garantie d'isolation DOM

En mode composant, **aucun élément n'est injecté en dehors du conteneur cible** :

| Élément | Mode page complète | Mode composant |
|---------|-------------------|----------------|
| `#ow-content` | `<body>` | Conteneur cible |
| `#app` | `<body>` | Conteneur cible |
| `#ontowave-floating-menu` | `<body>` | Conteneur cible |
| Styles CSS | `<head>` | `<head>` (partagé) |

## Indicateur d'avertissement ⚠️

Quand des ressources auxiliaires sont manquantes (nav, sitemap, index de recherche), le menu flottant affiche :
- **État compact** : badge `⚠️` discret à côté de l'icône 🌊
- **État étendu** : message de détail visible

Le badge disparaît automatiquement lorsque les ressources sont disponibles.
