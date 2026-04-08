# Thèmes de lecture

OntoWave propose trois thèmes de lecture adaptés à différents contextes et préférences visuelles.

## Thèmes disponibles

| Icône | Thème | Description |
|:------|:------|:------------|
| ☀️ | **Clair** | Fond blanc, texte foncé — mode par défaut |
| 📖 | **Sépia** | Fond sépia chaud, inspiré des liseuses |
| 🌙 | **Sombre** | Fond sombre, confort nocturne |

## Bascule discrète

Un bouton circulaire en bas à droite de l'écran affiche l'icône du thème actif.
Cliquez pour passer au thème suivant dans l'ordre : clair → sépia → sombre → clair.

## Persistance

Le thème choisi est mémorisé dans `localStorage` sous la clé `ow-theme`.
Il sera restauré automatiquement à la prochaine visite.

## Variables CSS

Les thèmes utilisent des variables CSS personnalisées sur `:root` :

```css
:root[data-ow-theme="sepia"] {
  --ow-bg: #f4ecd8;
  --ow-text: #5b4636;
  --ow-link: #8b6914;
  --ow-border: #d4b896;
  --ow-code-bg: #ede0cc;
}
```

Vous pouvez surcharger ces variables dans votre propre CSS pour personnaliser les thèmes.

## Configuration

Les thèmes sont activés par défaut. Pour les désactiver :

```json
{
  "ux": {
    "themes": false
  }
}
```

## Limite connue

- Les thèmes appliquent des styles avec `!important` pour garantir la priorité
- Les SVG injectés (Mermaid, PlantUML) ne sont pas affectés par les variables CSS
