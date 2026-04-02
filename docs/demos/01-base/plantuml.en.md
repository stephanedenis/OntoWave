# PlantUML Diagrams

Demonstration of PlantUML rendering in OntoWave: class diagrams, activity diagrams and component diagrams.

## Class Diagram

```plantuml
@startuml
class OntoWave {
    +config: Config
    +init(): void
    +render(markdown: string): string
}

class Config {
    +roots: Root[]
    +i18n: I18nConfig
}

class Root {
    +base: string
    +root: string
}

OntoWave --> Config
Config --> Root
@enduml
```

## Activity Diagram

```plantuml
@startuml
start
:Page loading;
:Read configuration;
if (URL hash present?) then (yes)
    :Load target Markdown file;
else (no)
    :Load default index file;
endif
:HTML rendering;
:Inject into DOM;
stop
@enduml
```

## Known Limitations

- PlantUML is rendered server-side via `plantuml.com` — diagrams require Internet access
- Long diagrams may exceed PlantUML's URL length limit
