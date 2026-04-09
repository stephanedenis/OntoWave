# Persistent Notes

OntoWave lets you take text notes associated with each page.
Notes are automatically saved to the browser's `localStorage`.

Click the **📝 Notes** button in the UX toolbar to open the notes panel.

## How It Works

- **One note per page**: each route (`/demos/03-ux/notes`, `/demos/03-ux/themes`…) has its own note
- **Auto-save**: a 600 ms debounce delay after the last keypress triggers saving
- **Persistent**: notes survive page reloads and browser restarts
- **Hidden when printing**: the `.ow-notes-panel` element is excluded from PDF print

## Storage Key

```javascript
// localStorage key format
`ow-note:${route}`

// Examples
'ow-note:/demos/03-ux/notes'
'ow-note:/demos/03-ux/themes'
```

## JavaScript API

```typescript
// Save a note for the current route
ontowave.ux.saveNote('/demos/03-ux/notes', 'My note content…');

// Read the note for a route
const text = ontowave.ux.loadNote('/demos/03-ux/notes');

// Get all notes (all pages)
const all = ontowave.ux.getAllNotes();
// Returns: Array<{ route: string, text: string }>
```

## Example: List All Notes

```javascript
const notes = ontowave.ux.getAllNotes();

if (notes.length === 0) {
  console.log('No notes saved.');
} else {
  notes.forEach(({ route, text }) => {
    console.log(`${route}: ${text.slice(0, 80)}…`);
  });
}
```

## Clearing Notes

```javascript
// Clear the note for the current page
ontowave.ux.saveNote(location.pathname, '');

// Clear all notes (full cleanup)
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

Or, to enable notes only:

```json
{
  "ux": { "notes": true }
}
```

## Interactive Demo

The notes panel for **this page** is active. Open it with the 📝 button, type some text,
then reload the page — your note will still be there.

> **Privacy**: notes never leave your browser. They are stored locally only and are
> never sent to any server.

---

← [PDF Export](print) | ↑ [Demo gallery](../)
