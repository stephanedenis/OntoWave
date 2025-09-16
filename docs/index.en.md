# OntoWave - Diagram generator for static sites

## Micro-application for static sites

OntoWave is a lightweight JavaScript diagram generator (69KB) designed for static sites. It makes it easy to add an interactive documentation system with floating menu and multilingual interface.

### Main features

- **Simple interface**: Floating menu with 🌊 icon
- **Multilingual**: Automatic French/English support  
- **Responsive**: Mobile and desktop adaptation
- **Configurable**: Integrated configuration panel
- **Lightweight**: Only 69KB minified
- **Ready to use**: One-line integration

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

That's it! OntoWave loads automatically and displays its interface. Click on the 🌊 icon at the top left to access the configuration panel and generate an HTML page configured to your needs, then download.

### Demos and examples

Explore our different configurations:

- **[Minimal configuration](demo/minimal.html)** - The simplest possible integration
- **[Advanced configuration](demo/advanced.html)** - With complete multilingual system  
- **[Full configuration](demo/full-config.html)** - All features enabled

### OntoWave Architecture

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

[Website] --> [OntoWave] : loads ontowave.min.js
[OntoWave] --> [Interface] : creates floating menu
[OntoWave] --> [Markdown] : processes .md files
[OntoWave] --> [Prism] : syntax highlighting
[OntoWave] --> [Mermaid] : generates diagrams

note right of [OntoWave]
  🌊 69KB all included
  Multilingual FR/EN
  Responsive interface
end note
@enduml
```

### Customization

OntoWave automatically adapts to your site's style. For advanced customization, check the examples in the `demo/` folder.

### 📜 License

Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)

*Created by Stéphane Denis* • [Source code on GitHub](https://github.com/stephanedenis/OntoWave)

---

*OntoWave transforms your static sites into interactive documentation in seconds!*
- **[PlantUML](https://plantuml.com/) diagrams** - UML diagrams via official server
- **Smart navigation** - Anchor preservation and smooth navigation
- **Modern interface** - Responsive and clean design
- **Ultra-lightweight** - Only 69KB, no dependencies
- **One-line installation** - Single script to include

### Usage

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Documentation</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

*Click on the 🌊 OntoWave icon in the top left corner to open the configuration panel and discover all available options. This is also where you can download the `ontowave.min.js` file and dynamically build your complete HTML page.*

### License

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave is published under the **CC BY-NC-SA 4.0** license (Creative Commons Attribution-NonCommercial-ShareAlike).

This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors be liable for any claims, damages or other liability.

**Source code:** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
