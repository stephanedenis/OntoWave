# Navigation to .puml files

Demonstration of direct navigation to PlantUML files from a Markdown page.

## Principle

When a Markdown link points to a `.puml` file, OntoWave:

1. Intercepts the click on the link
2. Fetches the `.puml` file from the server
3. Sends it to Kroki for SVG rendering
4. Displays the diagram inside the OntoWave interface

## Example

Consult the [architecture diagram](architecture.puml) to see how it works.

The browser's **Back** button allows you to return to this page.

## Markdown Syntax

```markdown
Consult the [architecture diagram](architecture.puml).
```

## Hyperlinks in diagrams

Links defined in a `.puml` file using the `[[url]]` syntax remain clickable in the rendered SVG.

## Known Limitations

- SVG rendering requires an Internet connection (Kroki.io API call)
- Very large `.puml` files may exceed Kroki server limits
