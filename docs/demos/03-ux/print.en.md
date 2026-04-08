# PDF Export

OntoWave optimizes rendering for client-side printing and PDF export.

## How to Print

Use the browser's native shortcut **`Ctrl+P`** (or `Cmd+P` on macOS) to open
the print dialog. Choose "Save as PDF" as the destination.

## Print Optimizations

OntoWave injects a `@media print` stylesheet that:

- **Hides** navigation elements: floating menu, sidebar, TOC, buttons
- **Applies** white background and black text to save ink
- **Uses** a serif font (Georgia) suited for paper reading
- **Sets** 2 cm margins on each side
- **Avoids** page breaks after headings
- **Avoids** page breaks inside code blocks and blockquotes

## CSS Excerpt

```css
@media print {
  #floating-menu, #sidebar, #toc { display: none !important; }
  body {
    background: white !important;
    color: black !important;
    font-family: Georgia, serif;
  }
  h1, h2, h3 { page-break-after: avoid; }
  @page { margin: 2cm; }
}
```

## Configuration

Print optimization is enabled by default. To disable it:

```json
{
  "ux": {
    "print": false
  }
}
```

## Known Limitations

- SVG diagrams (Mermaid, PlantUML) print correctly
- KaTeX formulas may require 100% zoom for optimal rendering
