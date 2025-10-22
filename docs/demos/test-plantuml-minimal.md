# Test PlantUML - Encodage ~0 (DEFLATE) + Insertion Directe

Ce document teste le nouveau système PlantUML avec encodage DEFLATE (`~0`) et insertion SVG directe sans wrappers.

## Diagramme Simple

```plantuml
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml
```

## Diagramme de Classes

```plantuml
@startuml
class User {
  +String name
  +String email
  +login()
  +logout()
}

class Admin {
  +manageUsers()
}

User <|-- Admin
@enduml
```

## Diagramme de Séquence

```plantuml
@startuml
participant Client
participant OntoWave
participant PlantUMLServer

Client -> OntoWave: Afficher page
OntoWave -> OntoWave: Parser Markdown
OntoWave -> OntoWave: Encoder DEFLATE (~0)
OntoWave -> PlantUMLServer: GET /svg/{encoded}
PlantUMLServer --> OntoWave: SVG brut
OntoWave -> OntoWave: Insertion directe
OntoWave --> Client: Page rendue
@enduml
```

---

**Tests attendus** :
- ✅ Encodage DEFLATE (~0) au lieu de HUFFMAN (~1)
- ✅ Pas de wrapper `.plantuml-diagram-wrapper`
- ✅ Pas de wrapper `.diagram`
- ✅ SVG inséré directement dans le DOM
- ✅ Liens cliquables préservés
