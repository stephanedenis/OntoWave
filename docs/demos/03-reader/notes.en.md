# Lightweight Notes

Demonstration of OntoWave's lightweight notes system.

## Notes Panel

A 📝 button appears in the reader bar (bottom-right). Clicking it opens a
notes panel associated with the **current page**.

Notes are:
- **Saved locally** in the browser's `localStorage`
- **Page-scoped**: each page has its own notes
- **Persistent**: they survive page reloads

## Storage Key

Notes are stored under the key `ow-notes:<hash>` where `<hash>` is the
current URL hash (without query parameters).

For example:
| Page | localStorage key |
|------|-----------------|
| `/fr/guide` | `ow-notes:#/fr/guide` |
| `/en/api` | `ow-notes:#/en/api` |

## Use Cases

- Annotate a complex section while reading
- List questions to ask the team
- Take notes on differences between versions
- Mark items to review

## Known Limitations

- Notes are **local only**: they don't sync across browsers or devices.
- Maximum capacity depends on the browser's `localStorage` quota (about 5 MB
  per domain).
- Notes are lost if the user clears browser data (cookies, site data).
- No note history or versioning is maintained.
