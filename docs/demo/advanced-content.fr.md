# OntoWave - Démo Avancée (Style MkDocs)

Cette démo présente OntoWave avec toutes ses fonctionnalités avancées dans un style similaire à MkDocs.

## Fonctionnalités de cette démo

Cette interface démontre :

- **🌍 Interface multilingue** (FR/EN) avec changement instantané
- **🎨 Design MkDocs** avec sidebar de navigation professionnelle  
- **🔍 Recherche intégrée** dans la documentation
- **⚙️ Panneau de configuration** complet
- **📱 Interface responsive** adaptée mobile et desktop

## Configuration avancée utilisée

```javascript
window.ontoWaveConfig = {
    locales: ["en", "fr"],
    defaultLocale: "en",
    sources: {
        en: "advanced-content.md",
        fr: "advanced-content.fr.md"
    },
    enablePrism: true,
    ui: {
        languageButtons: 'top-right',
        showMenu: false,  // Sidebar personnalisée
        showConfiguration: true,
        showSearch: true,
        target: '#ontowave-content'
    },
    features: {
        anchors: true,
        toc: false,  // Navigation personnalisée
        search: true,
        breadcrumbs: true,
        editButton: true,
        printButton: true
    },
    theme: {
        style: 'mkdocs',
        codeTheme: 'nord'
    }
};
```

## Interface personnalisée

La sidebar à gauche est entièrement personnalisée avec :

- **Navigation par sections** : Démarrage, Configuration, Avancé, Exemples
- **Recherche en temps réel** avec surlignage
- **Badge de version** avec indication du numéro
- **Style Nordic** professionnel et moderne

## Comparaison avec la démo minimale

| Fonctionnalité | Minimale | Avancée |
|----------------|----------|---------|
| Langues | 1 (EN) | 2 (EN+FR) |
| Interface | Auto | MkDocs custom |
| Navigation | Menu simple | Sidebar complète |
| Recherche | Non | Oui |
| Thème | Défaut | Nordic |
| Configuration | Basique | Complète |

## Cas d'usage

Cette configuration est idéale pour :

- **📚 Documentation complète** de projets
- **🌐 Sites multilingues** avec navigation avancée  
- **🏢 Documentation d'entreprise** avec apparence professionnelle
- **📖 Manuels utilisateur** avec recherche et navigation

## Testez les fonctionnalités

1. **Changement de langue** : Utilisez les boutons EN/FR en haut à droite
2. **Recherche** : Tapez dans la boîte de recherche de la sidebar
3. **Navigation** : Cliquez sur les sections dans la sidebar
4. **Configuration** : Ouvrez le panneau pour voir toutes les options

Comparez avec la [Démo Minimale](minimal-demo.html) pour voir la différence !
