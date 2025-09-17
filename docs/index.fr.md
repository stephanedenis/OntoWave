# OntoWave v1.0

Micro-application JavaScript légère (~18KB) pour sites statiques avec support multilingue, coloration syntaxique et diagrammes.

## Fonctionnalités

- **Traitement Markdown**: Analyse et rendu Markdown avec coloration syntaxique
- **Support Multilingue**: Internationalisation (i18n) intégrée
- **Intégration Prism**: Coloration syntaxique automatique pour les blocs de code
- **Diagrammes Mermaid**: Rendu de graphiques, diagrammes de séquence, etc.
- **Support PlantUML**: Diagrammes UML avec rendu en ligne
- **Léger**: ~18KB minifié, aucune dépendance
- **Configuration Simple**: Script à intégrer avec initialisation automatique

### Utilisation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Site avec OntoWave</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

C'est tout ! OntoWave se charge automatiquement et affiche son interface. Cliquez sur l'icône 🌊 en bas à droite pour accéder au panneau de configuration et générer une page HTML configurée selon vos besoins, puis télécharger le fichier `ontowave.min.js` pour votre projet.

### Architecture OntoWave

```plantuml
@startuml OntoWave_Architecture
!theme plain

package "Site Web Statique" {
  artifact "<<html>>\nindex.html\n📄" as HTML {
    note right
      Contient config JSON inline
      Point d'entrée unique
    end note
  }
  artifact "<<markdown>>\nindex.fr.md\n📝" as DocFR
  artifact "<<markdown>>\nindex.en.md\n📝" as DocEN
}

package "OntoWave (~18KB)" {
  artifact "<<javascript>>\nontowave.min.js\n⚙️" as Core
  
  package "Architecture Interne" {
    class Loader {
      +init()
      +loadContent()
    }
    class UIManager {
      +createInterface()
      +handleEvents()
    }
    class FloatingMenu {
      +show()
      +hide()
      +toggle()
    }
    class ConfigPanel {
      +open()
      +close()
      +saveSettings()
    }
    class MarkdownProcessor {
      +parse()
      +render()
    }
    class I18nSystem {
      +setLanguage()
      +translate()
    }
    
    package "Plugins" <<folder>> {
      interface SyntaxHighlighter
      interface DiagramRenderer
      
      class PrismPlugin implements SyntaxHighlighter
      class MermaidPlugin implements DiagramRenderer  
      class PlantUMLPlugin implements DiagramRenderer
    }
  }
}

' Relations UML précises
HTML *-- Core : composition\n(charge et contient)
Core ..> DocFR : dependency\n(charge selon locale)
Core ..> DocEN : dependency\n(charge selon locale)

' Architecture interne
Core *-- Loader : composition
Core *-- UIManager : composition
Core *-- I18nSystem : composition

UIManager --> FloatingMenu : aggregation
UIManager --> ConfigPanel : aggregation
UIManager --> MarkdownProcessor : aggregation

MarkdownProcessor --> PrismPlugin : uses
MarkdownProcessor --> MermaidPlugin : uses  
MarkdownProcessor --> PlantUMLPlugin : uses

note top of Core
  🌊 **OntoWave Core**
  ✨ Micro-application autonome
  📱 Interface responsive
  ⚙️ Configuration interactive
  📊 Export HTML disponible
end note

note bottom of HTML
  📄 **Point d'entrée unique**
  Configuration JSON intégrée
  Charge OntoWave automatiquement
end note

@enduml
```

###  Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
