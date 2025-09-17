# OntoWave v1.0

Lightweight JavaScript micro-application (~18KB) for static sites with multilingual support, syntax highlighting and diagrams.

## Features

- **Markdown Processing**: Parse and render Markdown with syntax highlighting
- **Multilingual Support**: Built-in internationalization (i18n)
- **Prism Integration**: Automatic syntax highlighting for code blocks
- **Mermaid Diagrams**: Rendering of charts, sequence diagrams, etc.
- **PlantUML Support**: UML diagrams with online rendering
- **Lightweight**: ~18KB minified, no dependencies
- **Simple Configuration**: Drop-in script with automatic initialization

### Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Site with OntoWave</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

That's it! OntoWave loads automatically and displays its interface. Click the 🌊 icon in the bottom right to access the configuration panel and generate an HTML page configured to your needs, then download the `ontowave.min.js` file for your project.

### OntoWave Architecture

```plantuml
@startuml OntoWave_Architecture
!theme plain

package "Static Website" {
  artifact "<<html>>\nindex.html\n📄" as HTML {
    note right
      Contains inline JSON config
      Single entry point
    end note
  }
  artifact "<<markdown>>\nindex.fr.md\n📝" as DocFR
  artifact "<<markdown>>\nindex.en.md\n📝" as DocEN
}

package "OntoWave (~18KB)" {
  artifact "<<javascript>>\nontowave.min.js\n⚙️" as Core
  
  package "Internal Architecture" {
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

' Precise UML relationships
HTML *-- Core : composition\n(loads and contains)
Core ..> DocFR : dependency\n(loads by locale)
Core ..> DocEN : dependency\n(loads by locale)

' Internal architecture
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
  ✨ Self-contained micro-app
  📱 Responsive interface
  ⚙️ Interactive configuration
  📊 HTML export available
end note

note bottom of HTML
  📄 **Single entry point**
  Integrated JSON configuration
  Loads OntoWave automatically
end note

@enduml
```

### License

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave is released under **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike) license.

This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages or other liability.

**Source code:** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
