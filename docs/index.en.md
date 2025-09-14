# OntoWave - Diagram generator for static sites

## 🌊 Micro-application for static sites

OntoWave is a lightweight JavaScript diagram generator (18KB) designed for static sites. It makes it easy to add an interactive documentation system with floating menu and multilingual interface.

### ✨ Main features

- **🎯 Simple interface**: Floating menu with 🌊 icon
- **🌐 Multilingual**: Automatic French/English support  
- **📱 Responsive**: Mobile and desktop adaptation
- **⚙️ Configurable**: Integrated configuration panel
- **📦 Lightweight**: Only 18KB minified
- **🚀 Ready to use**: One-line integration

### 🎯 Usage (HTML)

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

**That's it!** OntoWave loads automatically and displays its **floating menu** with the 🌊 icon at the bottom right of the page.

#### 🌊 Floating menu and configuration panel

- **Click the 🌊 icon** to access the OntoWave menu
- **Integrated configuration panel** with advanced options
- **Direct download** of the `ontowave.min.js` file
- **Complete HTML export** with your custom configuration
- **Multilingual interface** (FR/EN) with language buttons
- **Dynamic construction** of your optimized HTML page

This is also where you can download the `ontowave.min.js` file and dynamically build your complete HTML page.

### 📊 Demos and examples

Explore our different configurations:

- **[Minimal configuration](demo/minimal.html)** - The simplest possible integration
- **[Advanced configuration](demo/advanced.html)** - With complete multilingual system  
- **[Full configuration](demo/full-config.html)** - All features enabled

### 🏗️ OntoWave Architecture

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
  🌊 18KB all included
  🌐 Multilingual FR/EN
  📱 Responsive interface
end note
@enduml
```

###  License

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave is released under **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike) license.

**Source code:** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
