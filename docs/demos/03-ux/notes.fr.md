# Notes persistantes

OntoWave permet de prendre des notes textuelles associées à chaque page.
Les notes sont sauvegardées automatiquement dans le `localStorage` du navigateur.

Cliquez sur le bouton **📝 Notes** dans la barre UX pour ouvrir le panneau.

## Fonctionnement

- **Une note par page** : chaque route (`/demos/03-ux/notes`, `/demos/03-ux/themes`…) possède sa propre note
- **Sauvegarde automatique** : un délai de 600 ms après la dernière frappe déclenche la sauvegarde (debounce)
- **Persistance sur la session et au-delà** : les notes survivent aux rechargements et fermetures du navigateur
- **Panneau masqué à l'impression** : le bloc `.ow-notes-panel` est exclu de l'impression PDF

## Clé de stockage

```javascript
// Format de la clé localStorage
`ow-note:${route}`

// Exemples
'ow-note:/demos/03-ux/notes'
'ow-note:/demos/03-ux/themes'
```

## API JavaScript

```typescript
// Sauvegarder une note pour la route courante
ontowave.ux.saveNote('/demos/03-ux/notes', 'Mon contenu de note…');

// Lire la note d'une route
const texte = ontowave.ux.loadNote('/demos/03-ux/notes');

// Récupérer toutes les notes (toutes pages)
const toutes = ontowave.ux.getAllNotes();
// Retourne : Array<{ route: string, text: string }>
```

## Exemple : lister toutes les notes

```javascript
const notes = ontowave.ux.getAllNotes();

if (notes.length === 0) {
  console.log('Aucune note enregistrée.');
} else {
  notes.forEach(({ route, text }) => {
    console.log(`${route} : ${text.slice(0, 80)}…`);
  });
}
```

## Effacer une note

```javascript
// Effacer la note de la page courante
ontowave.ux.saveNote(location.pathname, '');

// Effacer toutes les notes (nettoyage complet)
Object.keys(localStorage)
  .filter(key => key.startsWith('ow-note:'))
  .forEach(key => localStorage.removeItem(key));
```

## Configuration

```json
{
  "ux": true
}
```

Ou, pour activer uniquement les notes :

```json
{
  "ux": { "notes": true }
}
```

## Démo interactive

Le panneau de notes de **cette page** est actif. Ouvrez-le avec le bouton 📝, saisissez
du texte, puis rechargez la page : votre note sera toujours là.

> **Vie privée** : les notes ne quittent jamais votre navigateur. Elles sont stockées
> uniquement en local et ne sont jamais envoyées vers un serveur.

---

← [Export PDF](print) | ↑ [Galerie des démos](../)
