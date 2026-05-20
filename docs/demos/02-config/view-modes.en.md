# View Modes

Demonstration of OntoWave's different display modes: sidebar, no sidebar, full screen.

## Available Modes

OntoWave offers several configurable display modes:

| Mode | Description |
|------|-------------|
| `sidebar` | Navigation sidebar visible (default) |
| `nosidebar` | Centered content without side navigation |
| `fullscreen` | Full-width content |

## Configuration

```javascript
window.ontoWaveConfig = {
    display: {
        mode: "sidebar",   // "sidebar" | "nosidebar" | "fullscreen"
        sidebar: true      // Show or hide the sidebar
    }
};
```

## Responsive Adaptation

OntoWave automatically adapts to small screens:
- On mobile (< 768px), the sidebar transforms into a hamburger menu
- `nosidebar` mode is recommended for content-dense pages

## Dark/Light Theme

```javascript
window.ontoWaveConfig = {
    theme: "auto"  // "light" | "dark" | "auto"
};
```

The `auto` mode follows system preferences (`prefers-color-scheme`).

## Known Limitations

- User-chosen theme persistence is not implemented (reload = back to config settings)
- Full screen mode is not available on pages with an active sidebar
