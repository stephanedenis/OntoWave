# OntoWave - Démo Minimale

Cette démo présente l'utilisation la plus simple d'OntoWave.

## Qu'est-ce que cette démo ?

Cette page démontre OntoWave avec une configuration minimale :
- Une seule langue (anglais)
- Configuration basique
- Contenu simple

## Configuration utilisée

```html
<script src="../ontowave.min.js"></script>
<script>
window.ontoWaveConfig = {
    locales: ["en"],
    defaultLocale: "en",
    sources: {
        en: "minimal-content.md"
    },
    enablePrism: true
};
</script>
```

## Fonctionnalités

- **🚀 Rapide** : Chargement instantané
- **📝 Simple** : Configuration en 3 lignes
- **🎯 Focalisé** : Une seule langue, une seule source

## Utilisation

1. Incluez le script OntoWave
2. Définissez votre configuration
3. Créez votre fichier Markdown

## Prochaine étape

Découvrez la [Démo Avancée](advanced-demo.html) pour voir toutes les fonctionnalités d'OntoWave !
