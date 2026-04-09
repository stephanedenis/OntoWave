# Reading Themes

OntoWave provides three reading themes switchable from the UX toolbar or via code.
The theme toggle in the top toolbar cycles through them.

## The Three Themes

| Theme | CSS class on `<body>` | Use case |
|---|---|---|
| **Light** | `ow-theme-light` | Bright environment (default) |
| **Sepia** | `ow-theme-sepia` | Dim light, warm tint |
| **Dark** | `ow-theme-dark` | Low-light environment |

## Exposed CSS Variables

Each theme redefines the following CSS variables on `:root`:

| Variable | Purpose |
|---|---|
| `--ow-bg` | Main background color |
| `--ow-text` | Body text color |
| `--ow-link` | Hyperlink color |
| `--ow-code-bg` | Code block background |
| `--ow-border` | Border and separator color |
| `--ow-sidebar-bg` | Sidebar background |

These variables can be overridden in your CSS to customize the themes.

## Persistence

The selected theme is saved to `localStorage` under the key `ow-reading-theme`.
It is automatically restored on every visit.

```javascript
// Possible values
localStorage.getItem('ow-reading-theme'); // 'light' | 'sepia' | 'dark'
```

## Theme Cycle

The rotation order is: **light → sepia → dark → light**.

## JavaScript API

```javascript
// Apply a specific theme
ontowave.ux.applyTheme('sepia');

// Read the currently saved theme
const theme = ontowave.ux.loadSavedTheme(); // 'light' | 'sepia' | 'dark'

// Move to the next theme
const next = ontowave.ux.cycleTheme(); // returns the new theme
```

## Configuration

```json
{
  "ux": true
}
```

Or, to enable themes only:

```json
{
  "ux": { "themes": true }
}
```

## CSS Customization

```css
/* Override background color for the dark theme */
body.ow-theme-dark {
  --ow-bg: #0d0d0d;
  --ow-text: #e0e0e0;
}
```

## Sample Content

Here is some content to observe theme differences:

> **Sepia** reproduces the look of a slightly yellowed piece of paper.
> It is the recommended theme for long reading sessions.

Inline code example: `const color = getComputedStyle(document.body).getPropertyValue('--ow-bg');`

```typescript
// Read the current theme from the UX API
const theme = ontowave.ux.loadSavedTheme();
console.log('Current theme:', theme);

// Or inspect the class applied on <body>
const isDark = document.body.classList.contains('ow-theme-dark');
console.log('Dark theme enabled:', isDark);
```

---

→ Next demo: [Keyboard navigation](keyboard)
