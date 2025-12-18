# OntoWave - Navigateur d'ontologies

🧭 **Navigateur d'ontologies intelligent avec chargement dynamique d'extensions**

OntoWave fait partie de l'écosystème Panini, un ensemble d'outils basés sur le modèle sémantique Panini pour la compression sémantique fractale et la navigation ontologique.

## 🏗️ Vision

**OntoWave** est un navigateur d'ontologies qui permet de :
- Naviguer intuitivement dans les structures ontologiques
- Charger dynamiquement des extensions selon le contenu rencontré
- Afficher des documents markdown enrichis avec des visualisations sémantiques
- S'intégrer avec l'écosystème Panini pour la compression et navigation sémantique

## 🌐 Écosystème Panini

OntoWave s'intègre dans l'écosystème Panini :

- **PaniniFS** : Filesystem avec compression sémantique fractale (source des ontologies)
- **OntoWave** : Navigateur d'ontologies (ce projet)
- **Panini-Gest** : Langue gestuelle avec modélisation 3D (ontologies gestuelles)
- **PaniniFS-Research** : Recherche et développement (modèles sémantiques avancés)

## 🚀 État Actuel vs Vision

### ✅ État Actuel (v1.0)
- Affichage de documents markdown enrichis
- Support PlantUML pour diagrammes
- Architecture de plugins modulaire
- Interface légère et performante

### 🎯 Vision (v2.0+)
- **Navigation ontologique** : Parcours intelligent des structures sémantiques
- **Chargement dynamique** : Extensions activées selon le contenu détecté
- **Intégration PaniniFS** : Accès direct au filesystem sémantique
- **Visualisations avancées** : Graphiques interactifs des relations ontologiques

## 🔌 Architecture de Plugins

```typescript
// Plugin chargé dynamiquement selon le contenu
interface ContentAwarePlugin {
  triggers: ContentPattern[];      // Déclencheurs (extensions, patterns)
  ontologyTypes: string[];        // Types d'ontologies supportées
  loadConditions: LoadCondition[]; // Conditions de chargement
}

// Exemple: Plugin RDF
const RDFNavigatorPlugin: ContentAwarePlugin = {
  triggers: ['.rdf', '.owl', '.ttl'],
  ontologyTypes: ['RDF', 'OWL', 'RDFS'],
  loadConditions: ['hasTriples', 'hasNamespaces']
}
```

## 🛠️ Installation

### Installation simple
```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon navigateur d'ontologies</title>
</head>
<body>
    <div id="content"></div>
    <script src="ontowave.min.js"></script>
</body>
</html>
```

### Configuration avancée
```html
<script>
window.ontoWaveConfig = {
  // Interface utilisateur
  ui: {
    menu: false,        // Désactiver le menu flottant
    header: true,
    sidebar: true,
    toc: true
  },
  
  // Sources de données externes avec CORS
  externalDataSources: [
    {
      name: "api-docs",
      baseUrl: "https://api.example.com/docs",
      corsEnabled: true,
      headers: {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  ],
  
  // Plugins
  plugins: {
    enabled: ["prism", "mermaid", "plantuml"],
    config: {
      prism: { theme: "default" }
    }
  }
};
</script>
```

Voir le [Guide de Configuration](docs/technical/development/CONFIGURATION-GUIDE.md) complet.

## 📋 Fonctionnalités

### Core (v1.0)

- ✅ Rendu Markdown avec Prism.js
- ✅ Diagrammes PlantUML et Mermaid intégrés
- ✅ **Support CORS** pour contenu externe (🆕)
- ✅ Navigation par glisser-déposer
- ✅ Architecture de plugins modulaire
- ✅ Mode multilingue
- ✅ Configuration flexible (UI, menu, plugins)

### Extensions Ontologiques (Roadmap v2.0)

- 🔄 **RDF Navigator** : Navigation dans les graphes RDF/OWL
- 🔄 **SKOS Browser** : Parcours des vocabulaires SKOS
- 🔄 **Semantic Relations** : Visualisation des relations sémantiques
- 🔄 **PaniniFS Integration** : Interface avec le filesystem sémantique
- 🔄 **Gestural Ontologies** : Intégration avec Panini-Gest

## 🔬 Recherche et Développement

OntoWave bénéficie des recherches menées dans **PaniniFS-Research** :

- Modèles sémantiques avancés (Panksepp)
- Algorithmes de compression fractale
- Analyses d'ambiguïtés sémantiques
- Navigation dans les structures ontologiques complexes

## 📚 Documentation

- [Guide de démarrage](docs/technical/development/SETUP-MINIMAL.md)
- [Guide de Configuration](docs/technical/development/CONFIGURATION-GUIDE.md)
- [Déploiement NPM](docs/technical/deployment/NPM-DEPLOYMENT.md)
- [Architecture des plugins](docs/PLUGIN-SYSTEM.md)
- [Intégration écosystème Panini](docs/panini/README.md)
- [Exemples d'usage](docs/examples/)

## 🤝 Contribution

OntoWave suit les standards de l'écosystème Panini :

- **Copilotage** : Workflow de développement avec IA
- **Standards PaniniFS** : Cohérence avec l'écosystème
- **Conventional Commits** : Messages de commit standardisés

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE)

---

🌟 **OntoWave** - Naviguer les ontologies avec élégance et performance
