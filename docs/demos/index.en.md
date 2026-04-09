# OntoWave Demo Gallery

Welcome to the OntoWave demonstration gallery. Each page illustrates a specific feature.

## Basic Features

| Demo | Description |
|------|-------------|
| [Markdown](01-base/markdown) | Markdown rendering: tables, lists, code, formatting |
| [Mermaid](01-base/mermaid) | Mermaid diagrams: flowcharts, sequences, graphs |
| [PlantUML](01-base/plantuml) | PlantUML diagrams: classes, activities |
| [.puml Navigation](01-base/puml-navigation) | Navigation to .puml files from Markdown |
| [Routing](01-base/routing) | Hash URL navigation |

## Configuration

| Demo | Description |
|------|-------------|
| [i18n](02-config/i18n) | Internationalisation and language toggle |
| [View Modes](02-config/view-modes) | Sidebar, no sidebar, light/dark theme |
| [Custom UI](02-config/ui-custom) | Title, logo, links, custom CSS |

## Reading Experience (UX)

| Demo | Description |
|------|-------------|
| [Themes](03-ux/themes) | Light, sepia, dark modes — CSS variables — persistence |
| [Keyboard navigation](03-ux/keyboard) | j/k shortcuts (scroll), n/p (page navigation) |
| [PDF Export](03-ux/print) | Print CSS, UI hiding, URLs in PDF output |
| [Notes](03-ux/notes) | Persistent per-page notes (localStorage, 600 ms debounce) |

## Extensibility

| Demo | Description |
|------|-------------|
| [Plugins](03-plugins/plugins) | Plugin architecture: hooks, events, examples |

## About

These pages serve both as **user documentation** and as **E2E test cases** for Playwright.

Each demo verifies:
- Loading without console errors
- Main Markdown content rendering
- Visual stability (reference screenshots)
