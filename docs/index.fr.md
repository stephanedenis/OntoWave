# OntoWave - Générateur de diagrammes pour sites statiques

## Micro-application pour sites statiques

OntoWave est un générateur de diagrammes JavaScript léger (69KB) conçu pour les sites statiques. Il permet d'ajouter facilement un système de documentation interactive avec menu flottant et interface multilingue.

### Fonctionnalités principales

- **Interface simple** : Menu flottant avec icône 🌊
- **Multilingue** : Support français/anglais automatique  
- **Responsive** : Adaptation mobile et desktop
- **Configurable** : Panneau de configuration intégré
- **Léger** : Seulement 69KB minifié
- **Prêt à l'emploi** : Integration en une ligne

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

C'est tout ! OntoWave se charge automatiquement et affiche son interface. Cliquez sur l'icône 🌊 en haut à gauche pour accéder au panneau de configuration et générer une page html configurée selon vos besoins, puis télécharger.

### Démos et exemples

Explorez nos différentes configurations :

- **[Configuration minimale](demo/minimal.html)** - L'intégration la plus simple possible
- **[Configuration avancée](demo/advanced.html)** - Avec système multilingue complet  
- **[Configuration complète](demo/full-config.html)** - Toutes les fonctionnalités activées

### Architecture OntoWave

```plantuml
@startuml
!theme plain
skinparam backgroundColor transparent

[Site Web] --> [OntoWave] : charge ontowave.min.js
[OntoWave] --> [Interface] : crée menu flottant
[OntoWave] --> [Markdown] : traite fichiers .md
[OntoWave] --> [Prism] : coloration syntaxique
[OntoWave] --> [Mermaid] : génère diagrammes

note right of [OntoWave]
  🌊 18KB tout inclus
  Multilingue FR/EN
  Interface responsive
end note
@enduml
```

###  Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
