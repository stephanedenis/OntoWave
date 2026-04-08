# Thèmes de lecture

Démonstration des thèmes de lecture d'OntoWave : clair, sépia et sombre.

## Bascule de thème

Un bouton discret apparaît en bas à droite de l'écran. Cliquer dessus fait
défiler les thèmes dans l'ordre :

| Thème | Icône | Usage typique |
|-------|-------|---------------|
| Clair (`light`) | ☀️ | Lecture en journée, écran rétroéclairé |
| Sépia (`sepia`) | 📜 | Lecture longue, yeux fatigués |
| Sombre (`dark`) | 🌙 | Lecture nocturne, économie d'énergie |

## Persistance

Le thème choisi est sauvegardé dans le `localStorage` du navigateur sous la
clé `ow-theme`. Il est restauré automatiquement à chaque chargement de la
page.

## Variables CSS

Les thèmes s'appuient sur des variables CSS personnalisées :

```css
body.ow-theme-sepia {
  --ow-bg: #f4ecd8;
  --ow-text: #3b2f1e;
  --ow-link: #7b5e3a;
}
body.ow-theme-dark {
  --ow-bg: #1e1e2e;
  --ow-text: #cdd6f4;
  --ow-link: #89b4fa;
}
```

Ces variables peuvent être surchargées dans votre propre CSS pour personnaliser
les couleurs.

## Intégration

Aucune configuration supplémentaire n'est requise. Les thèmes sont activés
automatiquement par OntoWave dès le chargement.

## Limite connue

- Les éléments injectés par des bibliothèques tierces (Mermaid, KaTeX) peuvent
  ne pas respecter les variables CSS des thèmes.
- Le mode `auto` (suivre les préférences système) n'est pas encore implémenté.
