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

### 🏗️ Architecture OntoWave

#### Vue d'ensemble des composants

```plantuml
@startuml Vue_Ensemble
!theme plain

component "index.html" as HTML
component "ontowave.min.js" as Core
component "index.fr.md" as DocFR
component "index.en.md" as DocEN

HTML --> Core : charge
Core --> DocFR : selon locale FR
Core --> DocEN : selon locale EN

note bottom of HTML : Point d'entrée unique\nConfiguration JSON intégrée
note bottom of Core : Cœur OntoWave\n18KB minifié
note bottom of DocFR : Documentation française
note bottom of DocEN : Documentation anglaise

@enduml
```

#### Classes principales

```plantuml
@startuml Classes_Principales
!theme plain

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

Loader --> UIManager : utilise
Loader --> I18nSystem : utilise
UIManager --> FloatingMenu : gère
UIManager --> ConfigPanel : gère
UIManager --> MarkdownProcessor : gère

@enduml
```

#### Système de plugins

```plantuml
@startuml Systeme_Plugins
!theme plain

interface SyntaxHighlighter {
  +highlight()
}

interface DiagramRenderer {
  +render()
}

class PrismPlugin
class MermaidPlugin
class PlantUMLPlugin

SyntaxHighlighter <|.. PrismPlugin
DiagramRenderer <|.. MermaidPlugin
DiagramRenderer <|.. PlantUMLPlugin

class MarkdownProcessor {
  +parse()
  +render()
}

MarkdownProcessor --> PrismPlugin : utilise
MarkdownProcessor --> MermaidPlugin : utilise
MarkdownProcessor --> PlantUMLPlugin : utilise

@enduml
```

###  Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
