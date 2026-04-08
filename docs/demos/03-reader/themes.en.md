# Reading Themes

Demonstration of OntoWave's reading themes: light, sepia, and dark.

## Theme Toggle

A discreet button appears at the bottom-right of the screen. Clicking it
cycles through themes in order:

| Theme | Icon | Typical use |
|-------|------|-------------|
| Light (`light`) | ☀️ | Daytime reading, backlit screen |
| Sepia (`sepia`) | 📜 | Extended reading, tired eyes |
| Dark (`dark`) | 🌙 | Night reading, energy saving |

## Persistence

The chosen theme is saved in the browser's `localStorage` under the key
`ow-theme`. It is automatically restored on each page load.

## CSS Variables

Themes rely on CSS custom properties:

```css
body.ow-theme-sepia {
  --ow-bg: #f4ecd8;
  --ow-text: #3b2f1e;
  --ow-link: #7b5e3a;
}
body.ow-theme-dark {
  --ow-bg: #1e1e2e;
  --ow-text: #cdd6f4;
  --ow-link: #89b4fa;
}
```

These variables can be overridden in your own CSS to customize the colors.

## Integration

No additional configuration required. Themes are automatically activated by
OntoWave on load.

## Known Limitations

- Elements injected by third-party libraries (Mermaid, KaTeX) may not respect
  the theme CSS variables.
- The `auto` mode (follow system preferences) is not yet implemented.
