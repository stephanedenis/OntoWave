# 🌊 Démo Mermaid - Diagrammes de Flux (Flowcharts)

## 🎯 Pourquoi cette fonctionnalité est utile

Les diagrammes Mermaid permettent de créer des visualisations directement en Markdown, **sans images externes** ni outils tiers. Parfait pour :

- **Documentation technique** : Flux de processus, architectures
- **Collaboration** : Code source = diagramme (versionnable Git)
- **Maintenance** : Modifier le diagramme = modifier le texte
- **Portabilité** : Pas de dépendance à des outils graphiques

## 📋 Ce que vous allez voir dans cette démo

1. **Flowchart simple** (TD - Top Down)
2. **Graph horizontal** (LR - Left to Right)
3. **Flowchart avec décisions** (Conditions if/else)
4. **Pie Chart** (Graphique en camembert)
5. **Graph avec styles personnalisés**

---

## 1. Flowchart Simple - Architecture OntoWave

```mermaid
graph TD
    A[Utilisateur charge page.html] --> B{OntoWave détecté ?}
    B -->|Oui| C[Initialisation OntoWave]
    B -->|Non| D[Affichage HTML statique]
    C --> E[Chargement Markdown]
    E --> F[Parsing contenu]
    F --> G[Rendu HTML]
    G --> H[Traitement diagrammes]
    H --> I[Coloration syntaxe]
    I --> J[Affichage final]
```

**Ce diagramme montre** : Le flux d'initialisation d'OntoWave, de la détection jusqu'au rendu final.

---

## 2. Graph Horizontal - Pipeline de Build

```mermaid
graph LR
    SRC[Code Source] --> BUILD[npm run build]
    BUILD --> UGLIFY[Minification]
    UGLIFY --> DIST[dist/ontowave.min.js]
    DIST --> DEPLOY[Déploiement docs/]
    DEPLOY --> CDN[CDN jsdelivr]
```

**Ce diagramme montre** : Le pipeline de build et déploiement d'OntoWave.

---

## 3. Flowchart avec Décisions - Détection Langue

```mermaid
graph TD
    START([Démarrage OntoWave]) --> READ[Lire navigator.language]
    READ --> CHECK{Langue supportée ?}
    CHECK -->|fr| FR[Charger index.fr.md]
    CHECK -->|en| EN[Charger index.en.md]
    CHECK -->|autre| FALLBACK[Charger langue par défaut]
    FR --> RENDER[Rendu page]
    EN --> RENDER
    FALLBACK --> RENDER
    RENDER --> END([Page affichée])
    
    style START fill:#e1f5e1
    style END fill:#e1f5e1
    style CHECK fill:#fff4e1
    style RENDER fill:#e1e9f5
```

**Ce diagramme montre** : La logique de détection automatique de langue (Fix #3 v1.0.1).

---

## 4. Pie Chart - Répartition Taille Bundle

```mermaid
pie title Composition Bundle OntoWave v1.0.1 (74KB)
    "Core Engine" : 35
    "Markdown Parser" : 20
    "PlantUML Support" : 15
    "Mermaid Integration" : 12
    "Prism Highlighting" : 10
    "UI/Menu/Config" : 8
```

**Ce graphique montre** : La répartition approximative des composants dans le bundle minifié.

---

## 5. Graph avec Styles - Cycle de Vie Contenu

```mermaid
graph TD
    A[Fichier .md] -->|fetch| B[Contenu brut]
    B -->|parseMarkdown| C[HTML généré]
    C -->|processDiagrams| D[Mermaid rendu]
    D -->|processPrism| E[Code coloré]
    E -->|innerHTML| F[DOM final]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:1px
    style D fill:#fbb,stroke:#333,stroke-width:1px
    style E fill:#bfb,stroke:#333,stroke-width:1px
```

**Ce diagramme montre** : Le traitement pipeline du contenu Markdown avec styles visuels.

---

## ✅ Tests Manuels

**Validation visuelle** :

- [ ] Les 5 diagrammes sont rendus correctement
- [ ] Les flowcharts utilisent les bonnes directions (TD, LR)
- [ ] Les formes sont variées : rectangles, losanges, cercles
- [ ] Les flèches sont correctement orientées
- [ ] Le pie chart affiche les pourcentages
- [ ] Les styles personnalisés (couleurs) sont appliqués
- [ ] Pas de message d'erreur Mermaid dans la console
- [ ] Diagrammes responsive (s'adaptent à la largeur)

**Tests interactifs** :

- [ ] Zoom navigateur (Ctrl +/-) : diagrammes restent lisibles
- [ ] Mode responsive (F12 > Toggle device) : pas de débordement
- [ ] Survol des éléments : pas d'effet indésirable

---

## 📚 Syntaxe Mermaid

**Formes disponibles** :

- `A[Rectangle]` : Rectangle
- `B(Rectangle arrondi)` : Coins arrondis
- `C{Losange}` : Décision/Condition
- `D([Stade])` : Début/Fin de processus
- `E[[Sous-routine]]` : Processus prédéfini
- `F[(Base de données)]` : Stockage

**Directions** :

- `graph TD` : Top-Down (vertical)
- `graph LR` : Left-Right (horizontal)
- `graph BT` : Bottom-Top
- `graph RL` : Right-Left

**Liens** :

- `A --> B` : Flèche simple
- `A --- B` : Ligne sans flèche
- `A -.-> B` : Flèche pointillée
- `A ==> B` : Flèche épaisse
- `A -->|texte| B` : Flèche avec label

---

**🔗 Retour** : [← Index démos](README.md)
