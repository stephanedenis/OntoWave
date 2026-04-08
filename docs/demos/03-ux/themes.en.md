# Reading Themes

OntoWave offers three reading themes adapted to different contexts and visual preferences.

## Available Themes

| Icon | Theme | Description |
|:-----|:------|:------------|
| ☀️ | **Light** | White background, dark text — default mode |
| 📖 | **Sepia** | Warm sepia background, inspired by e-readers |
| 🌙 | **Dark** | Dark background, night comfort |

## Subtle Toggle

A circular button at the bottom right of the screen shows the current theme icon.
Click to move to the next theme in order: light → sepia → dark → light.

## Persistence

The chosen theme is stored in `localStorage` under the key `ow-theme`.
It will be automatically restored on the next visit.

## CSS Variables

Themes use custom CSS variables on `:root`:

```css
:root[data-ow-theme="sepia"] {
  --ow-bg: #f4ecd8;
  --ow-text: #5b4636;
  --ow-link: #8b6914;
  --ow-border: #d4b896;
  --ow-code-bg: #ede0cc;
}
```

You can override these variables in your own CSS to customize themes.

## Configuration

Themes are enabled by default. To disable them:

```json
{
  "ux": {
    "themes": false
  }
}
```

## Known Limitations

- Themes apply styles with `!important` to ensure priority
- Injected SVGs (Mermaid, PlantUML) are not affected by CSS variables
