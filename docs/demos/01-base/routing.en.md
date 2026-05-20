# Hash URL Routing

Demonstration of OntoWave's routing system: page navigation via URL hash (`#`).

## How Routing Works

OntoWave listens to hash changes in the URL (`window.location.hash`) to load the corresponding Markdown file.

### Route Examples

- `index.html#fr/index` → loads `demos/01-base/index.fr.md`
- `index.html#en/index` → loads `demos/01-base/index.en.md`
- `index.html#fr/markdown` → this page (in French)
- `index.html#en/markdown` → this page (in English)

## Internal Navigation

Relative Markdown links work as routes:

- [Back to demos home](../index)
- [See Mermaid demo](mermaid)
- [See PlantUML demo](plantuml)

## URL Format

A route format is `#<lang>/<path>` where:
- `<lang>` corresponds to a `base` in the `roots` configuration
- `<path>` is the relative path from the corresponding `root`

## Language Fallback

If the requested language is not supported, OntoWave uses the default language (`i18n.default`).

## Known Limitations

- Routes are case-sensitive on Linux file systems
- In-page anchors (`#heading`) are not distinguished from OntoWave routes
