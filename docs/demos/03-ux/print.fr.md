# Export PDF

OntoWave optimise le rendu pour l'impression et l'export PDF côté client.

## Comment imprimer

Utilisez le raccourci natif du navigateur **`Ctrl+P`** (ou `Cmd+P` sur macOS) pour ouvrir
la boîte de dialogue d'impression. Choisissez « Enregistrer en PDF » comme destination.

## Optimisations d'impression

OntoWave injecte une feuille de style `@media print` qui :

- **Masque** les éléments de navigation : menu flottant, sidebar, TOC, boutons
- **Applique** fond blanc et texte noir pour économiser l'encre
- **Utilise** une police serif (Georgia) adaptée à la lecture papier
- **Définit** des marges de 2 cm sur chaque côté
- **Évite** les sauts de page après les titres
- **Évite** les sauts de page à l'intérieur des blocs de code et citations

## Extrait CSS

```css
@media print {
  #floating-menu, #sidebar, #toc { display: none !important; }
  body {
    background: white !important;
    color: black !important;
    font-family: Georgia, serif;
  }
  h1, h2, h3 { page-break-after: avoid; }
  @page { margin: 2cm; }
}
```

## Configuration

L'optimisation d'impression est activée par défaut. Pour la désactiver :

```json
{
  "ux": {
    "print": false
  }
}
```

## Limite connue

- Les diagrammes SVG (Mermaid, PlantUML) s'impriment correctement
- Les formules KaTeX peuvent nécessiter un zoom à 100% pour un rendu optimal
