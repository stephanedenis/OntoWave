# Fonctionnalités Markdown

Démonstration du rendu Markdown de base par OntoWave : tableaux, listes, titres, formatage, liens et blocs de code.

## Tableaux avec alignements

| Gauche | Centré | Droite |
|:-------|:------:|-------:|
| alpha | bravo | 1 |
| charlie | delta | 22 |
| echo | foxtrot | 333 |

## Titres

### Niveau 3

#### Niveau 4

##### Niveau 5

## Formatage du texte

- **Gras** et *italique* et ~~barré~~
- `code inline` dans une phrase
- [Lien vers OntoWave](https://ontowave.org)

## Listes imbriquées

1. Élément un
   - Sous-élément A
   - Sous-élément B
2. Élément deux
3. Élément trois

## Bloc de code

```javascript
// Exemple OntoWave minimal
window.ontoWaveConfig = {
    roots: [{ base: "fr", root: "docs" }],
    i18n: { default: "fr", supported: ["fr"] }
};
```

## Citation

> OntoWave transforme des fichiers Markdown en documentation interactive dans le navigateur, sans aucune dépendance.

## Limite connue

- Les tableaux sans ligne de séparation (`|---|`) ne sont pas rendus comme tableaux
- Les images externes peuvent être bloquées par les politiques CSP du navigateur
