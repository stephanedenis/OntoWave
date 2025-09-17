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
  artifact "index.html" as HTML
  artifact "index.fr.md" as DocFR
  artifact "index.en.md" as DocEN
}

package "OntoWave (~18KB)" {
  artifact "ontowave.min.js" as Core
}

' Classes OntoWave (hors package pour éviter erreur PlantUML)
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

' Plugins
interface SyntaxHighlighter
interface DiagramRenderer
class PrismPlugin implements SyntaxHighlighter
class MermaidPlugin implements DiagramRenderer  
class PlantUMLPlugin implements DiagramRenderer

' Relations principales
HTML --> Core : charge et contient
Core --> DocFR : charge selon locale
Core --> DocEN : charge selon locale

' Architecture interne
Core --> Loader : contient
Core --> UIManager : contient
Core --> I18nSystem : contient

UIManager --> FloatingMenu : gere
UIManager --> ConfigPanel : gere
UIManager --> MarkdownProcessor : gere

MarkdownProcessor --> PrismPlugin : utilise
MarkdownProcessor --> MermaidPlugin : utilise  
MarkdownProcessor --> PlantUMLPlugin : utilise

note top of Core
  OntoWave Core
  Micro-application autonome
  Interface responsive
  Configuration interactive
  Export HTML disponible
end note

note bottom of HTML
  Point d'entree unique
  Configuration JSON integree
  Charge OntoWave automatiquement
end note

@enduml
```

###  Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
