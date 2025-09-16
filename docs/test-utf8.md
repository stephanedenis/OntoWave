# Test d'encodage UTF-8 PlantUML

Voici un test pour vérifier que les caractères accentués français fonctionnent correctement dans PlantUML.

## Diagramme avec accents

```plantuml
@startuml
title Générateur de diagrammes français
actor Développeur as dev
actor Utilisateur as user

dev -> user: Crée un système
user -> dev: Répond avec données
note right: Gère les caractères spéciaux :\n• é (accent aigu)\n• è (accent grave)\n• à (accent grave)\n• ç (cédille)\n• ê (accent circonflexe)\n• ô (accent circonflexe)

dev -> user: Génère le résultat
note left: Système prêt !
@enduml
```

## Test avec caractères spéciaux

```plantuml
@startuml
!define PRIMARY_COLOR #E1F5FE
!define SECONDARY_COLOR #0277BD

package "Système français" as sys {
  class "Générateur" as gen {
    +créer()
    +générer()
    +gérer()
  }
  
  class "Données" as data {
    +récupérer()
    +traiter()
    +sauvegarder()
  }
}

gen --> data: utilise
note top: Prend en charge:\n- Caractères accentués\n- Cédilles (ç)\n- Tous les accents français
@enduml
```

## Résultat attendu

Les diagrammes ci-dessus devraient afficher correctement tous les caractères accentués français sans problème d'encodage.
