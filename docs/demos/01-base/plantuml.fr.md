# Diagrammes PlantUML

Démonstration du rendu PlantUML dans OntoWave : diagrammes de classes, d'activités et de composants.

## Diagramme de classes

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

## Diagramme d'activité

```plantuml
@startuml
start
:Chargement de la page;
:Lecture de la configuration;
if (Hash URL présent ?) then (oui)
    :Charge le fichier Markdown cible;
else (non)
    :Charge le fichier index par défaut;
endif
:Rendu HTML;
:Injection dans le DOM;
stop
@enduml
```

## Limite connue

- PlantUML est rendu côté serveur via `plantuml.com` — les diagrammes nécessitent Internet
- Les longs diagrammes peuvent dépasser la limite d'URL de PlantUML
