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
  [index.html] as HTML
  [config.json] as Config
  [index.fr.md] as DocFR
  [index.en.md] as DocEN
}

package "OntoWave (~18KB)" {
  [ontowave.min.js] as Core
  
  package "Composants Internes" {
    [Chargeur] as Loader
    [Interface UI] as UI
    [Menu Flottant] as Menu
    [Panneau Config] as Panel
    [Processeur Markdown] as Markdown
    [Système I18n] as I18n
    
    package "Plugins" {
      [Prism.js] as Prism
      [Mermaid] as Mermaid
      [PlantUML] as PlantUML
    }
  }
}

HTML --> Core : charge
Core --> Config : lit configuration
Core --> DocFR : affiche (locale=fr)
Core --> DocEN : affiche (locale=en)

Core ||--|| Loader : contient
Loader --> UI : initialise
UI --> Menu : crée
UI --> Panel : crée
UI --> I18n : configure
Markdown --> Prism : coloration
Markdown --> Mermaid : diagrammes
Markdown --> PlantUML : diagrammes UML

note right of Core
  ✨ Micro-application autonome
  🌊 Interface responsive
  ⚙️ Configuration interactive
  📊 Export HTML disponible
end note

@enduml
```

###  Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
