# UI Customization

OntoWave allows customizing the user interface via configuration.

## UI Options

```javascript
window.ontoWaveConfig = {
  ui: {
    header: true,    // Show header banner
    sidebar: true,   // Show sidebar with TOC
    toc: true,       // Table of contents
    footer: true,    // Show footer
    minimal: false,  // Minimal mode (disables all)
    menu: true       // Floating 🌊 menu
  }
};
```

## Minimal Mode Example

Set `minimal: true` to disable all UI chrome:

```javascript
window.ontoWaveConfig = {
  ui: { minimal: true }
};
```

Perfect for embedding OntoWave in iframes or widgets.

## Sidebar with TOC

When `sidebar: true`, OntoWave automatically generates a table of contents from H1-H3 headings:

### Section 1
Content here...

### Section 2
More content...

### Section 3
Even more content...

## Header Customization

The header can show breadcrumbs, language selector, and navigation menu.

## Footer

The footer shows copyright, links, or custom content.

## Comparison

| Mode | Use Case | UI Elements |
|:-----|:---------|:------------|
| Full UI | Documentation site | All enabled |
| Minimal | Embedded widget | None |
| Custom | Tailored experience | Pick & choose |
