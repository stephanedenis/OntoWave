# Raccourcis clavier

OntoWave supporte des raccourcis clavier pour naviguer entre les pages sans utiliser la souris.

## Raccourcis disponibles

| Touche | Action |
|:-------|:-------|
| `j` ou `n` | Page suivante |
| `k` ou `p` | Page précédente |

## Comportement

- Les raccourcis s'activent uniquement quand vous n'êtes pas en train de saisir dans un champ texte
- La navigation utilise l'ordre défini dans `sitemap.json`
- Les touches `j`/`k` suivent la convention vi/vim (mouvement vertical)
- Les touches `n`/`p` suivent la convention next/previous

## Configuration

Les raccourcis clavier sont activés par défaut. Pour les désactiver :

```json
{
  "ux": {
    "keyboard": false
  }
}
```

## Intégration technique

Le module UX est chargé via `ontowave-ux.js`, un script léger (~8 KB) qui s'ajoute
à toute installation OntoWave.

```html
<!-- Après le script principal OntoWave -->
<script src="/ontowave-ux.js"></script>
```

## Limite connue

- Si aucun `sitemap.json` n'est disponible, la navigation clavier est sans effet
- Les raccourcis ne fonctionnent pas dans les iframes
