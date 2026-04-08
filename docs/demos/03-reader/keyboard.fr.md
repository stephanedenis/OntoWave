# Raccourcis clavier

Démonstration des raccourcis clavier de navigation d'OntoWave.

## Raccourcis disponibles

| Touche | Action |
|--------|--------|
| `j` | Faire défiler la page vers le bas (200 px) |
| `k` | Faire défiler la page vers le haut (200 px) |
| `n` ou `→` | Aller à la page suivante |
| `p` ou `←` | Aller à la page précédente |

## Règles d'activation

Les raccourcis sont **désactivés** quand le focus est sur :

- Un champ de texte (`<input>`)
- Une zone de texte (`<textarea>`)
- Un menu déroulant (`<select>`)
- Un élément éditable (`contenteditable`)

Cela évite les conflits avec la saisie de texte normale.

## Navigation séquentielle

Les raccourcis `n`/`p` (et `→`/`←`) utilisent le `sitemap.json` pour
déterminer les pages précédente et suivante selon leur ordre d'apparition
dans le sitemap.

Si aucun sitemap n'est disponible, les raccourcis de navigation n'ont pas
d'effet.

## Activation

Les raccourcis clavier sont activés automatiquement. Aucune configuration
n'est nécessaire.

## Limite connue

- Les raccourcis `→` et `←` ne fonctionnent pas si un élément de la page
  capture déjà ces touches (ex : un carousel, un formulaire).
- Le défilement avec `j`/`k` ne fonctionne pas sur les pages dont la hauteur
  est inférieure à la fenêtre.
