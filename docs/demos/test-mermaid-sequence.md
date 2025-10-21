# 🔄 Démo Mermaid - Diagrammes de Séquence et Classes

## 🎯 Pourquoi cette fonctionnalité est utile

Les diagrammes de séquence et de classes sont essentiels pour :

- **Documentation API** : Montrer les interactions entre composants
- **Architecture logicielle** : Visualiser les relations entre classes
- **Processus métier** : Séquence d'appels et réponses
- **Debugging** : Comprendre le flow d'exécution

## 📋 Ce que vous allez voir dans cette démo

1. **Sequence Diagram simple** - Chargement page OntoWave
2. **Sequence avec boucles** - Traitement multi-diagrammes
3. **Class Diagram** - Architecture OntoWave
4. **State Diagram** - États du menu flottant

---

## 1. Sequence Diagram - Chargement Page OntoWave

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as Navigateur
    participant OW as OntoWave
    participant S as Serveur

    U->>B: Ouvre index.html
    B->>OW: Charge ontowave.min.js
    OW->>OW: new OntoWave(config)
    OW->>OW: createInterface()
    OW->>OW: loadInitialPage()
    
    alt Hash présent dans URL
        OW->>S: fetch(#page.md)
    else Pas de hash
        OW->>OW: Détecte langue navigateur
        OW->>S: fetch(index.fr.md)
    end
    
    S-->>OW: Contenu Markdown
    OW->>OW: renderMarkdown(content)
    OW->>OW: processDiagrams()
    OW->>OW: processPrism()
    OW->>B: innerHTML = html
    B->>U: Affiche page complète
```

**Ce diagramme montre** : Le flux complet d'initialisation et de chargement d'une page.

---

## 2. Sequence avec Boucles - Traitement Diagrammes

```mermaid
sequenceDiagram
    participant OW as OntoWave
    participant M as Mermaid
    participant P as PlantUML
    participant DOM as DOM

    OW->>DOM: querySelectorAll('.mermaid')
    
    loop Pour chaque bloc Mermaid
        DOM-->>OW: Élément mermaid
        OW->>M: mermaid.init(element)
        M-->>OW: SVG généré
    end
    
    OW->>DOM: querySelectorAll('img[plantuml]')
    
    loop Pour chaque image PlantUML
        DOM-->>OW: Élément img
        OW->>P: fetch(plantUMLUrl)
        P-->>OW: SVG content
        OW->>OW: attachPlantUMLLinks(img)
        OW->>DOM: replaceChild(svg, img)
    end
    
    OW->>DOM: Page complète rendue
```

**Ce diagramme montre** : Le traitement parallèle des diagrammes Mermaid et PlantUML.

---

## 3. Class Diagram - Architecture OntoWave

```mermaid
classDiagram
    class OntoWave {
        -config: Object
        -container: HTMLElement
        -mermaidLoaded: boolean
        -prismLoaded: boolean
        +constructor(config)
        +createInterface(locale)
        +loadPage(pagePath)
        +renderMarkdown(content)
        +processDiagrams(contentDiv)
        +processPrism(contentDiv)
        +attachPlantUMLLinks(imgElement)
        +switchLanguage(lang)
    }
    
    class MarkdownParser {
        +parseHeaders(text)
        +parseLinks(text)
        +parseTables(text)
        +parseCodeBlocks(text)
        +parseMermaid(text)
        +parsePlantUML(text)
    }
    
    class DiagramProcessor {
        +initMermaid()
        +processMermaidBlocks()
        +processPlantUMLBlocks()
        +encodePlantUML(text)
    }
    
    class NavigationManager {
        +loadPage(path)
        +updateBreadcrumb(path)
        +goHome()
        +handleHashChange()
    }
    
    OntoWave --> MarkdownParser : utilise
    OntoWave --> DiagramProcessor : utilise
    OntoWave --> NavigationManager : utilise
    MarkdownParser --> DiagramProcessor : délègue
```

**Ce diagramme montre** : La structure de classes simplifiée d'OntoWave.

---

## 4. State Diagram - États Menu Flottant

```mermaid
stateDiagram-v2
    [*] --> Collapsed : Page chargée
    
    Collapsed --> Expanded : Click icône menu
    Expanded --> Collapsed : Click icône menu
    Expanded --> Collapsed : Click ailleurs
    
    Collapsed --> Dragging : Mouse down (drag)
    Dragging --> Collapsed : Mouse up
    
    Expanded --> ConfigOpen : Click ⚙️ Configuration
    ConfigOpen --> Expanded : Click fermer config
    ConfigOpen --> Expanded : Click appliquer
    
    Collapsed --> LanguageSwitch : Click langue
    LanguageSwitch --> Collapsed : Page rechargée
    
    note right of Expanded
        Menu ouvert avec
        toutes les options
    end note
    
    note right of ConfigOpen
        Panneau configuration
        modal affiché
    end note
```

**Ce diagramme montre** : Les différents états possibles du menu flottant OntoWave.

---

## 5. Sequence - Navigation Interne avec PlantUML Links

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant SVG as SVG PlantUML
    participant OW as OntoWave
    participant S as Serveur

    U->>SVG: Click lien <a href="page.md">
    SVG->>OW: Event listener intercepte
    OW->>OW: preventDefault()
    OW->>OW: loadPage('page.md')
    OW->>S: fetch('page.md')
    S-->>OW: Contenu Markdown
    OW->>OW: renderMarkdown()
    OW->>OW: innerHTML = html
    Note over OW,U: Navigation SANS<br/>rechargement page!
```

**Ce diagramme montre** : Le mécanisme de navigation interne via les liens SVG PlantUML (Fix #2b).

---

## ✅ Tests Manuels

**Validation visuelle** :

- [ ] Sequence diagrams affichent les participants correctement
- [ ] Les flèches sont orientées dans le bon sens
- [ ] Les boucles (loop) sont bien délimitées
- [ ] Les alternatives (alt/else) sont claires
- [ ] Class diagram montre les relations entre classes
- [ ] State diagram affiche les transitions d'états
- [ ] Pas d'erreur Mermaid dans la console
- [ ] Diagrammes responsive

**Tests sémantiques** :

- [ ] Sequence diagram #1 reflète bien le processus réel OntoWave
- [ ] Class diagram correspond à l'architecture réelle
- [ ] State diagram menu est cohérent avec le comportement observé

---

## 📚 Syntaxe Mermaid

**Sequence Diagrams** :

```
sequenceDiagram
    participant A as Acteur A
    A->>B: Message synchrone
    A-->>B: Message asynchrone
    B->>B: Auto-message
    
    alt Condition vraie
        B->>C: Action 1
    else Condition fausse
        B->>D: Action 2
    end
    
    loop Boucle
        C->>C: Répéter
    end
```

**Class Diagrams** :

```
classDiagram
    class Animal {
        +name: string
        +age: int
        +makeSound()
    }
    
    class Dog {
        +breed: string
        +bark()
    }
    
    Animal <|-- Dog : Héritage
```

**State Diagrams** :

```
stateDiagram-v2
    [*] --> État1
    État1 --> État2 : transition
    État2 --> [*]
```

---

**🔗 Retour** : [← Index démos](index.md)
