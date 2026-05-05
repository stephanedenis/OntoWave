# Navigation clavier

OntoWave installe des raccourcis clavier pour naviguer dans la documentation sans souris.
Testez-les sur cette page : assurez-vous que le focus n'est pas dans un champ de saisie.

## Raccourcis disponibles

| Touche | Action | Détail |
|---|---|---|
| `j` | Défiler vers le bas | +120 px |
| `k` | Défiler vers le haut | −120 px |
| `n` | Page suivante | Utilise le lien de navigation "suivant" |
| `p` | Page précédente | Utilise le lien de navigation "précédent" |

## Condition d'activation

Les touches `j`, `k`, `n`, `p` sont ignorées si le focus se trouve dans un élément interactif :
`<input>`, `<textarea>`, `<select>`, ou tout élément avec `contenteditable`.

Cela évite les conflits lors de la saisie de texte.

## Démo interactive

Appuyez sur `j` pour faire défiler ce texte vers le bas.
Appuyez sur `k` pour remonter.

---

Cette page présente suffisamment de contenu pour rendre le défilement sensible.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab
illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

---

## Configuration

```json
{
  "ux": true
}
```

Ou, pour activer uniquement la navigation clavier :

```json
{
  "ux": { "keyboard": true }
}
```

## API JavaScript

```typescript
// Installer la navigation clavier manuellement
const cleanup = ontowave.ux.installKeyboardNav(() => {
  const links = document.querySelectorAll<HTMLAnchorElement>('footer a[href]');

  return {
    prev: links[0]?.getAttribute('href') ?? undefined,
    next: links[1]?.getAttribute('href') ?? undefined
  };
});

// Désinstaller (ex. lors d'un changement de route)
cleanup();
```

La fonction passée en paramètre est appelée à chaque appui sur `n` ou `p` pour déterminer
dynamiquement les URLs de navigation.

## Intégration avec le routeur OntoWave

Quand `ux: true` est défini dans la config, `installKeyboardNav` est appelé automatiquement
et se synchronise avec le routeur interne de la bibliothèque.

---

← [Thèmes](themes)
