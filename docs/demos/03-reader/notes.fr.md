# Notes légères

Démonstration du système de notes légères d'OntoWave.

## Panneau de notes

Un bouton 📝 apparaît dans la barre de lecture (en bas à droite). Cliquer
dessus ouvre un panneau de notes associé à la **page courante**.

Les notes sont :
- **Sauvegardées localement** dans le `localStorage` du navigateur
- **Cloisonnées par page** : chaque page a ses propres notes
- **Persistantes** : elles survivent aux rechargements de la page

## Clé de stockage

Les notes sont stockées sous la clé `ow-notes:<hash>` où `<hash>` est le
hash URL courant (sans les paramètres de requête).

Par exemple :
| Page | Clé localStorage |
|------|-----------------|
| `/fr/guide` | `ow-notes:#/fr/guide` |
| `/en/api` | `ow-notes:#/en/api` |

## Cas d'usage

- Annoter une section complexe pendant la lecture
- Lister des questions à poser à l'équipe
- Prendre des notes sur les différences entre versions
- Marquer les éléments à revoir

## Limite connue

- Les notes sont **uniquement locales** : elles ne se synchronisent pas entre
  navigateurs ou appareils.
- La capacité maximale dépend du quota `localStorage` du navigateur (5 Mo
  environ par domaine).
- Les notes sont perdues si l'utilisateur vide les données du navigateur
  (cookies, site data).
- Aucun historique ni versionnage des notes n'est conservé.
