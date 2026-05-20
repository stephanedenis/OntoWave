# Mermaid Diagrams

Demonstration of Mermaid rendering in OntoWave: flowcharts, sequence diagrams and graphs.

## Flowchart

```mermaid
flowchart TD
    A[Markdown File] --> B{Contains Mermaid?}
    B -- Yes --> C[Load Mermaid.js]
    B -- No --> D[Direct HTML render]
    C --> E[SVG render]
    D --> E
    E --> F[Display in browser]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant M as Mermaid CDN

    U->>B: Opens the page
    B->>B: Parses Markdown
    B->>M: Loads mermaid.min.js
    M-->>B: Library loaded
    B->>B: Renders mermaid blocks
    B-->>U: Displays diagrams
```

## Simple Graph

```mermaid
graph LR
    OntoWave --> Markdown
    OntoWave --> Mermaid
    OntoWave --> PlantUML
    OntoWave --> KaTeX
```

## Known Limitations

- Mermaid is loaded asynchronously from CDN — diagrams appear after a brief delay
- Mermaid themes do not automatically adapt to OntoWave's dark/light theme
