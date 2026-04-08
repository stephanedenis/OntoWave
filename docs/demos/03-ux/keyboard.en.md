# Keyboard Shortcuts

OntoWave supports keyboard shortcuts to navigate between pages without a mouse.

## Available Shortcuts

| Key | Action |
|:----|:-------|
| `j` or `n` | Next page |
| `k` or `p` | Previous page |

## Behavior

- Shortcuts only activate when you are not typing in a text field
- Navigation uses the order defined in `sitemap.json`
- `j`/`k` keys follow the vi/vim convention (vertical movement)
- `n`/`p` keys follow the next/previous convention

## Configuration

Keyboard shortcuts are enabled by default. To disable them:

```json
{
  "ux": {
    "keyboard": false
  }
}
```

## Technical Integration

The UX module is loaded via `ontowave-ux.js`, a lightweight script (~8 KB) that adds
to any OntoWave installation.

```html
<!-- After the main OntoWave script -->
<script src="/ontowave-ux.js"></script>
```

## Known Limitations

- If no `sitemap.json` is available, keyboard navigation has no effect
- Shortcuts do not work inside iframes
