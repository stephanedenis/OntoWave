# Configuration avancée OntoWave

Cette page démontre une configuration avec système multilingue complet.

## Fonctionnalités activées

- **Interface bilingue** : Français/Anglais avec détection automatique
- **Boutons de langue** : Disponibles en fixe ET dans le menu (`both`)
- **Thème adaptatif** : Suit les préférences système (`auto`)
- **Titre affiché** : En-tête OntoWave visible

## Configuration utilisée

```javascript
window.OntoWaveConfig = {
    ui: {
        languageButtons: 'both',
        showTitle: true,
        theme: 'auto'
    },
    content: {
        supportedLanguages: ['fr', 'en'],
        defaultLanguage: 'fr'
    }
};
```

## Test des fonctionnalités

- **Boutons de langue** : Testez les boutons FR/EN pour changer la langue
- **Menu OntoWave** : Cliquez sur l'icône 🌊 pour accéder aux options
- **Interface responsive** : Redimensionnez la fenêtre pour voir l'adaptation

## Navigation multilingue

Le système détecte automatiquement la langue préférée et bascule l'interface complète. Tous les textes du menu OntoWave s'adaptent à la langue sélectionnée.

Cette configuration est idéale pour des sites multilingues nécessitant une interface complète.
