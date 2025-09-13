# OntoWave - Générateur de diagrammes pour sites statiques

## 🌊 Micro-application pour sites statiques

OntoWave est un générateur de diagrammes JavaScript léger (18KB) conçu pour les sites statiques. Il permet d'ajouter facilement un système de documentation interactive avec menu flottant et interface multilingue.

### ✨ Fonctionnalités principales

- **🎯 Interface simple** : Menu flottant avec icône 🌊
- **🌐 Multilingue** : Support français/anglais automatique  
- **📱 Responsive** : Adaptation mobile et desktop
- **⚙️ Configurable** : Panneau de configuration intégré
- **📦 Léger** : Seulement 18KB minifié
- **🚀 Prêt à l'emploi** : Integration en une ligne

### 🎯 Utilisation

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

### 📊 Démos et exemples

Explorez nos différentes configurations :

- **[Configuration minimale](demo/minimal.html)** - L'intégration la plus simple possible
- **[Configuration avancée](demo/advanced.html)** - Avec système multilingue complet  
- **[Configuration complète](demo/full-config.html)** - Toutes les fonctionnalités activées

### 🏗️ Structure de fichiers

```
@startuml
!theme plain
skinparam backgroundColor transparent
skinparam defaultFontSize 12

folder "📁 docs/" {
  file "📄 index.html" as index
  file "📄 index.fr.md" as fr
  file "📄 index.en.md" as en
  file "📄 ontowave.min.js" as js
  file "📄 config.json" as config
  
  folder "📁 demo/" {
    file "📄 minimal.html" as minimal
    file "📄 advanced.html" as advanced  
    file "📄 full-config.html" as full
  }
}

index --> js : charge
index --> fr : contenu FR
index --> en : contenu EN
js --> config : configuration

demo --> js : exemples
@enduml
```

### 🛠️ Configuration

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

### 🎨 Personnalisation

OntoWave s'adapte automatiquement au style de votre site. Pour une personnalisation avancée, consultez les exemples dans le dossier `demo/`.

### 📜 Licence

Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)

*Créé par Stéphane Denis* • [Code source sur GitHub](https://github.com/stephanedenis/OntoWave)

---

*OntoWave transforme vos sites statiques en documentation interactive en quelques secondes !*
- **Diagrammes [PlantUML](https://plantuml.com/)** - Diagrammes UML via serveur officiel
- **Navigation intelligente** - Préservation des ancres et navigation fluide
- **Interface moderne** - Design responsive et épuré
- **Ultra-léger** - Seulement 19KB, aucune dépendance
- **Installation en une ligne** - Un seul script à inclure

### Utilisation

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ma Documentation</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

*Cliquez sur l'icône 🌊 OntoWave dans le coin supérieur gauche pour ouvrir le panneau de configuration et découvrir toutes les options disponibles. C'est également là que vous pouvez télécharger le fichier `ontowave.min.js` et construire dynamiquement votre page HTML complète.*

### Licence

![CC BY-NC-SA](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png) **Stéphane Denis**

OntoWave est publié sous licence **CC BY-NC-SA 4.0** (Creative Commons Attribution-NonCommercial-ShareAlike).

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, expresse ou implicite. En aucun cas les auteurs ne seront responsables de réclamations, dommages ou autres responsabilités.

**Code source :** [GitHub - OntoWave](https://github.com/stephanedenis/OntoWave)
