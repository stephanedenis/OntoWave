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
  [index.html] as HTML
  [config.json] as Config
  [index.fr.md] as DocFR
  [index.en.md] as DocEN
}

package "OntoWave (~18KB)" {
  [ontowave.min.js] as Core
  
  package "Internal Components" {
    [Loader] as Loader
    [UI Interface] as UI
    [Floating Menu] as Menu
    [Config Panel] as Panel
    [Markdown Processor] as Markdown
    [I18n System] as I18n
    
    package "Plugins" {
      [Prism.js] as Prism
      [Mermaid] as Mermaid
      [PlantUML] as PlantUML
    }
  }
}

HTML --> Core : loads
Core --> Config : reads configuration
Core --> DocFR : displays (locale=fr)
Core --> DocEN : displays (locale=en)

Core ||--|| Loader : contains
Loader --> UI : initializes
UI --> Menu : creates
UI --> Panel : creates
UI --> I18n : configures
Markdown --> Prism : highlighting
Markdown --> Mermaid : diagrams
Markdown --> PlantUML : UML diagrams

note right of Core
  ✨ Self-contained micro-app
  🌊 Responsive interface
  ⚙️ Interactive configuration
  📊 HTML export available
end note

@enduml
```

### License

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave is released under **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike) license.

This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages or other liability.

**Source code:** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
