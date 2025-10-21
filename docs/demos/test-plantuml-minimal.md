# 📊 PlantUML - Diagrammes de Séquence

OntoWave supporte les **diagrammes PlantUML** avec rendu SVG haute qualité directement dans la page.

## 🎯 Exemples

### Diagramme de Séquence Simple

```plantuml
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml
```

### Diagramme de Classes

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

### Architecture OntoWave

```plantuml
@startuml
participant Client
participant OntoWave
participant PlantUMLServer

Client -> OntoWave: Charger page
OntoWave -> OntoWave: Parser Markdown
OntoWave -> OntoWave: Encoder diagrammes
OntoWave -> PlantUMLServer: Requête SVG
PlantUMLServer --> OntoWave: SVG généré
OntoWave -> OntoWave: Insertion inline
OntoWave --> Client: Page affichée
@enduml
```

---

## 💡 Avantages

- **SVG haute qualité** : Rendu vectoriel, zoom sans perte
- **Liens cliquables** : Navigation interactive préservée
- **Performance** : Insertion directe, pas de wrapper
- **Compatibilité** : Toute syntaxe PlantUML supportée
