# OntoWave - Générateur de diagrammes pour sites statiques

## Micro-application pour sites statiques

OntoWave est un générateur de diagrammes JavaScript léger (18KB) conçu pour les sites statiques. Il permet d'ajouter facilement un système de documentation interactive avec menu flottant et interface multilingue.

### Fonctionnalités principales

- **Interface simple** : Menu flottant avec icône 🌊
- **Multilingue** : Support français/anglais automatique  
- **Responsive** : Adaptation mobile et desktop
- **Configurable** : Panneau de configuration intégré
- **Léger** : Seulement 18KB minifié
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

C'est tout ! OntoWave se charge automatiquement et affiche son interface.

### Diagrammes supportés

OntoWave intègre nativement **Mermaid** et **PlantUML** pour vos diagrammes :

**Mermaid :**
```mermaid
graph LR
    A[Utilisateur] --> B[OntoWave]
    B --> C[Interface]
    B --> D[Diagrammes]
    C --> E[Menu 🌊]
    D --> F[Mermaid]
    D --> G[PlantUML]
```

**PlantUML :**
```plantuml
@startuml
participant Utilisateur
participant OntoWave
participant "Serveur PlantUML"

Utilisateur -> OntoWave : Charge la page
OntoWave -> OntoWave : Détecte diagrammes
OntoWave -> "Serveur PlantUML" : Génère image
"Serveur PlantUML" --> OntoWave : Retourne diagramme
OntoWave --> Utilisateur : Affiche page complète
@enduml
```

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

### Configuration

Le fichier `config.json` permet de personnaliser OntoWave :

```json
{
  "locales": ["fr", "en"],
  "defaultLocale": "fr",
  "sources": {
    "fr": "index.fr.md",
    "en": "index.en.md"
  }
}
```

### 📥 Téléchargement

Récupérez OntoWave depuis le panneau de configuration :

1. Cliquez sur l'icône 🌊 en bas à droite
2. Sélectionnez "Configuration"  
3. Utilisez les options de téléchargement

### Personnalisation

OntoWave s'adapte automatiquement au style de votre site. Pour une personnalisation avancée, consultez les exemples dans le dossier `demo/`.

### 📜 Licence

### 📜 Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
