# PlantUML Diagrams

OntoWave supports PlantUML diagrams via the Kroki.io API, rendered as inline SVG.

## Component Diagram

```plantuml
@startuml
!theme plain

package "OntoWave Architecture" {
  [Router] --> [Markdown Parser]
  [Markdown Parser] --> [HTML Renderer]
  [HTML Renderer] --> [Enhancer]
  [Enhancer] --> [Mermaid]
  [Enhancer] --> [PlantUML/Kroki]
}

database "Content" {
  [index.md]
  [demo.md]
}

[Content] --> [Router]

@enduml
```

## Sequence Diagram

```plantuml
@startuml
!theme plain

actor User
participant "Browser" as B
participant "OntoWave" as OW
participant "Kroki API" as K

User -> B: Open page
B -> OW: Load script
OW -> OW: Detect PlantUML blocks
OW -> K: POST diagram source
K --> OW: Return SVG
OW -> B: Inject SVG inline
B --> User: Display diagram
@enduml
```

## Class Diagram

```plantuml
@startuml
!theme plain

class AppConfig {
  +roots: Root[]
  +i18n?: I18nConfig
  +ui?: UIConfig
}

class RouterService {
  +get(): Route
  +subscribe(callback)
  +navigate(path)
}

class MarkdownRenderer {
  +render(mdSrc): string
}

class PostRenderEnhancer {
  +afterRender(html, route)
}

AppConfig --* RouterService
RouterService --> MarkdownRenderer
MarkdownRenderer --> PostRenderEnhancer

@enduml
```

**Note**: PlantUML diagrams require internet connection to Kroki.io API.
