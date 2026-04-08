# PDF Export

Demonstration of OntoWave's client-side PDF export.

## Print Button

A 🖨️ button appears in the reader bar (bottom-right of the screen).
Clicking it triggers the browser's print dialog.

From this dialog, you can:
- Print to a physical printer
- **Export as PDF** (by choosing "Print to PDF")

## Print CSS

OntoWave automatically injects `@media print` styles that:

- Hide navigation elements (sidebar, TOC, floating menu, reader bar, notes
  panel)
- Reset background to white and text to black
- Remove shadows and unnecessary content margins
- Expand the content to full page width

```css
@media print {
  .ow-reader-bar,
  .ow-notes-panel,
  #floating-menu,
  #sidebar,
  #toc { display: none !important; }
  body { background: white !important; color: black !important; }
  #app { max-width: 100% !important; }
}
```

## Tips

- For best PDF output, switch to the **light** theme before printing.
- Use "Page Setup" in the print dialog to adjust margins and orientation.
- Mermaid/PlantUML diagrams are rendered as inline SVG and print correctly.

## Known Limitations

- Icon fonts and some CSS effects may not render correctly depending on
  browser/printer.
- Images hosted on a third-party domain may be blocked by CSP policies when
  printing.
