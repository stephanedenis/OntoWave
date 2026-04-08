# Keyboard Shortcuts

Demonstration of OntoWave's keyboard navigation shortcuts.

## Available Shortcuts

| Key | Action |
|-----|--------|
| `j` | Scroll page down (200 px) |
| `k` | Scroll page up (200 px) |
| `n` or `→` | Go to next page |
| `p` or `←` | Go to previous page |

## Activation Rules

Shortcuts are **disabled** when focus is on:

- A text field (`<input>`)
- A text area (`<textarea>`)
- A dropdown (`<select>`)
- An editable element (`contenteditable`)

This avoids conflicts with normal text input.

## Sequential Navigation

The `n`/`p` (and `→`/`←`) shortcuts use `sitemap.json` to determine the
previous and next pages based on their order in the sitemap.

If no sitemap is available, navigation shortcuts have no effect.

## Activation

Keyboard shortcuts are enabled automatically. No configuration is required.

## Known Limitations

- The `→` and `←` shortcuts don't work if a page element already captures
  those keys (e.g., a carousel, a form).
- Scrolling with `j`/`k` doesn't work on pages whose height is less than
  the window height.
