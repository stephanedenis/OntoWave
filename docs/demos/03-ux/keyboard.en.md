# Keyboard Navigation

OntoWave installs keyboard shortcuts for navigating documentation without a mouse.
Try them on this page — make sure the focus is not inside an input field.

## Available Shortcuts

| Key | Action | Detail |
|---|---|---|
| `j` | Scroll down | +120 px |
| `k` | Scroll up | −120 px |
| `n` | Next page | Uses the "next" navigation link |
| `p` | Previous page | Uses the "previous" navigation link |

## Activation Condition

The keys `j`, `k`, `n`, `p` are ignored when the focus is inside an interactive element:
`<input>`, `<textarea>`, `<select>`, or any element with `contenteditable`.

This avoids conflicts while typing text.

## Interactive Demo

Press `j` to scroll this text down.
Press `k` to scroll back up.

---

This page has enough content to make the scrolling noticeable.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab
illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

---

## Configuration

```json
{
  "ux": true
}
```

Or, to enable keyboard navigation only:

```json
{
  "ux": { "keyboard": true }
}
```

## JavaScript API

```typescript
// Install keyboard navigation manually
const cleanup = ontowave.ux.installKeyboardNav(() => {
  const navLinks = document.querySelectorAll('main > p:last-of-type a');
  return {
    prev: navLinks[0]?.getAttribute('href') ?? undefined,
    next: navLinks[1]?.getAttribute('href') ?? undefined
  };
});

// Uninstall (e.g. on route change)
cleanup();
```

The function passed as a parameter is called on each `n` or `p` keypress to dynamically
determine the navigation URLs.

## Integration with the OntoWave Router

When `ux: true` is set in the config, `installKeyboardNav` is called automatically
and synchronizes with the library's internal router.

---

← [Themes](themes) | → [PDF Export](print)
