# Diagrammes Mermaid

Démonstration du rendu Mermaid dans OntoWave : diagrammes de flux, séquences et graphes.

## Diagramme de flux

```mermaid
flowchart TD
    A[Fichier Markdown] --> B{Contient Mermaid ?}
    B -- Oui --> C[Chargement Mermaid.js]
    B -- Non --> D[Rendu HTML direct]
    C --> E[Rendu SVG]
    D --> E
    E --> F[Affichage dans le navigateur]
```

## Diagramme de séquence

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as Navigateur
    participant M as Mermaid CDN

    U->>B: Ouvre la page
    B->>B: Parse le Markdown
    B->>M: Charge mermaid.min.js
    M-->>B: Bibliothèque chargée
    B->>B: Rend les blocs mermaid
    B-->>U: Affiche les diagrammes
```

## Graphe simple

```mermaid
graph LR
    OntoWave --> Markdown
    OntoWave --> Mermaid
    OntoWave --> PlantUML
    OntoWave --> KaTeX
```

## Limite connue

- Mermaid est chargé depuis le CDN de manière asynchrone — les diagrammes apparaissent après un court délai
- Les thèmes Mermaid ne s'adaptent pas automatiquement au thème sombre/clair d'OntoWave
