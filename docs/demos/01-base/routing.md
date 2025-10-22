# SPA Routing

OntoWave uses hash-based routing for Single Page Application navigation.

## Hash Navigation

Try these links:
- [Section 2](#section-2)
- [Section 3](#section-3)
- [Back to top](#spa-routing)

The page doesn't reload, only the hash changes!

## Section 2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. OntoWave detects hash changes and scrolls to anchors automatically.

## Section 3

You can also use query parameters:
- [View this page in split mode](?view=split)
- [View source only](?view=md)
- [Back to normal](routing.html)

## External Pages

Navigate to other demos:
- [Markdown Features](markdown.html)
- [Mermaid Diagrams](mermaid.html)
- [PlantUML Diagrams](plantuml.html)

## 404 Handling

Try a non-existent page: [This page doesn't exist](nonexistent.html)

OntoWave will show a 404 message automatically.

## URL Structure

```
#/path/to/page?view=split&custom=param
│ │           └─────┬─────┘
│ │                 │
│ │                 └─ Query parameters
│ └─ Path (can be nested: /fr/demo/page)
└─ Hash symbol (SPA routing)
```
