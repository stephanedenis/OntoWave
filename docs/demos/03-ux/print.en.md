# PDF Export and Printing

OntoWave includes optimized print CSS to produce clean PDFs from any browser.
The **🖨** button in the UX toolbar triggers `window.print()`.

## Elements Hidden When Printing

The following elements are automatically hidden (`display: none`):

| Selector | Hidden element |
|---|---|
| `#sidebar` | Navigation sidebar |
| `#toc` | Table of contents |
| `#site-header` | Site header |
| `#floating-menu` | Floating menu |
| `.ow-ux-toolbar` | UX toolbar (theme, notes, print) |
| `.ow-notes-panel` | Notes panel |

## Applied Print Styles

```css
@media print {
  body {
    background: white;
    color: black;
    font-size: 12pt;
    line-height: 1.5;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #555;
  }

  pre, code {
    border: 1px solid #ccc;
    background: #f8f8f8;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td, th {
    border: 1px solid #999;
    padding: 4pt 8pt;
  }
}
```

## Sample Printable Content

The content below illustrates print quality:

### Data Table

| Property | Type | Default | Description |
|---|---|---|---|
| `themes` | `boolean` | `true` | Enables reading themes |
| `keyboard` | `boolean` | `true` | Enables keyboard shortcuts |
| `notes` | `boolean` | `true` | Enables the notes panel |
| `prefetch` | `boolean` | `true` | Markov prefetching |

### Code Example

```javascript
// Initialize the UX module (via the API exposed by the bundle)
ontowave.ux.initUx({
  themes: true,
  keyboard: true,
  notes: true,
  prefetch: true
});
```

### Long Text

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi
tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Mauris placerat eleifend
leo. Quisque sit amet est et sapien ullamcorper pharetra.

> **Note**: URLs are automatically shown after links when printing,
> making it possible to trace references in a PDF.

## Manual Trigger

```javascript
// Equivalent to the 🖨 button
window.print();
```

## Configuration

The print button is part of the standard UX toolbar. It is available as soon as
`ux: true` is present in the configuration.

```json
{
  "ux": true
}
```

---

← [Keyboard navigation](keyboard) | → [Notes](notes)
