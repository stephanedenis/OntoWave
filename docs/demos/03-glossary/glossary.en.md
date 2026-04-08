# Glossary — Dictionary with dotted underline and sidebar tooltip

This page demonstrates OntoWave's **glossary** feature. Terms defined in the loaded dictionary are underlined with a dotted line. On click, their definition appears in the sidebar panel.

## Glossary Terms in Action

**UAF** (Unified Architecture Framework) is the OMG standard for enterprise architecture modelling through views and viewpoints.

The concept of **Capability** is central in modern architecture frameworks. A Capability represents an organisation's measurable ability to achieve a defined outcome.

**IT Governance** encompasses the mechanisms for directing and managing IT resources within an organisation.

## Expected Behaviour

- Defined terms appear **underlined with a dotted blue line** (`text-decoration: underline dotted`)
- A **click** on a term shows its definition in the sidebar panel: term, short definition and link to the full entry
- Hovering also triggers a **tooltip** after a configurable delay (default: 300 ms)
- Terms inside `code` blocks are excluded: `UAF`, `Capability`, `IT Governance`

## Configuration

The feature is enabled via `config.json`:

```json
{
  "glossary": {
    "enabled": true,
    "sources": ["/demos/03-glossary/glossary.en.json"],
    "matching": {
      "caseSensitive": false,
      "wordBoundary": true,
      "firstOccurrenceOnly": false
    },
    "exclude": { "elements": ["code", "pre", "kbd"] },
    "ui": {
      "underlineStyle": "dotted",
      "clickBehavior": "sidebar",
      "tooltip": { "showOnHover": true, "delay": 300, "maxWidth": 340 }
    }
  }
}
```

## Multi-source Merging (last-wins)

OntoWave supports multiple glossary sources. The last file loaded overwrites conflicting entries:

```json
{
  "sources": [
    "https://culture.example.org/glossary.en.json",
    "./glossary.en.json"
  ]
}
```

Merge key: `term.toLowerCase()` + `alias.toLowerCase()`. If two sources define **UAF**, the second source takes priority (last-wins).

## Known Limitations

- SVG referenced via `<img src="...">` is out of scope (DOM is opaque)
- Inline SVG (Mermaid) can be annotated with `svg.inline: true`, but wrapping `<text>` in SVG `<a>` may affect layout coordinates
