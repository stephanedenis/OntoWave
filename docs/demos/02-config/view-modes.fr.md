# Modes d'affichage

Démonstration des différents modes d'affichage d'OntoWave : sidebar, sans sidebar, plein écran.

## Modes disponibles

OntoWave propose plusieurs modes d'affichage configurables :

| Mode | Description |
|------|-------------|
| `sidebar` | Barre latérale de navigation visible (défaut) |
| `nosidebar` | Contenu centré sans navigation latérale |
| `fullscreen` | Contenu en pleine largeur |

## Configuration

```javascript
window.ontoWaveConfig = {
    display: {
        mode: "sidebar",   // "sidebar" | "nosidebar" | "fullscreen"
        sidebar: true      // Afficher ou masquer la sidebar
    }
};
```

## Adaptation responsive

OntoWave s'adapte automatiquement aux petits écrans :
- Sur mobile (< 768px), la sidebar se transforme en menu hamburger
- Le mode `nosidebar` est recommandé pour les pages à contenu dense

## Thème sombre/clair

```javascript
window.ontoWaveConfig = {
    theme: "auto"  // "light" | "dark" | "auto"
};
```

Le mode `auto` suit les préférences système (`prefers-color-scheme`).

## Limite connue

- La persistance du thème choisi par l'utilisateur n'est pas implémentée (rechargement = retour aux paramètres de config)
- Le mode plein écran n'est pas disponible sur les pages avec une sidebar active
