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

### 🏗️ OntoWave Architecture

#### Component Overview

```plantuml
@startuml Component_Overview
!theme plain

component "index.html" as HTML
component "ontowave.min.js" as Core
component "index.fr.md" as DocFR
component "index.en.md" as DocEN

HTML --> Core : loads
Core --> DocFR : by locale FR
Core --> DocEN : by locale EN

note bottom of HTML : Single entry point\nIntegrated JSON configuration
note bottom of Core : OntoWave Core\n18KB minified
note bottom of DocFR : French documentation
note bottom of DocEN : English documentation

@enduml
```

#### Main Classes

```plantuml
@startuml Main_Classes
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

Loader --> UIManager : uses
Loader --> I18nSystem : uses
UIManager --> FloatingMenu : manages
UIManager --> ConfigPanel : manages
UIManager --> MarkdownProcessor : manages

@enduml
```

#### Plugin System

```plantuml
@startuml Plugin_System
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

MarkdownProcessor --> PrismPlugin : uses
MarkdownProcessor --> MermaidPlugin : uses
MarkdownProcessor --> PlantUMLPlugin : uses

@enduml
```

### License

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave is released under **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike) license.

This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages or other liability.

**Source code:** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
