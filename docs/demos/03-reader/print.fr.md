# Export PDF

Démonstration de l'export PDF côté client d'OntoWave.

## Bouton d'impression

Un bouton 🖨️ apparaît dans la barre de lecture (en bas à droite de l'écran).
Cliquer dessus déclenche la boîte de dialogue d'impression du navigateur.

À partir de cette boîte, vous pouvez :
- Imprimer sur une imprimante physique
- **Exporter en PDF** (en choisissant « Imprimer vers PDF »)

## CSS d'impression

OntoWave injecte automatiquement des styles `@media print` qui :

- Masquent les éléments de navigation (sidebar, TOC, menu flottant, barre de
  lecture, panneau de notes)
- Réinitialisent l'arrière-plan à blanc et le texte en noir
- Suppriment les ombres et les marges superflues du contenu
- Étendent le contenu à toute la largeur de la page

```css
@media print {
  .ow-reader-bar,
  .ow-notes-panel,
  #floating-menu,
  #sidebar,
  #toc { display: none !important; }
  body { background: white !important; color: black !important; }
  #app { max-width: 100% !important; }
}
```

## Conseils

- Pour un meilleur résultat PDF, activez le thème **clair** avant d'imprimer.
- Utilisez « Mise en page » dans la boîte d'impression pour ajuster les marges
  et l'orientation.
- Les diagrammes Mermaid/PlantUML sont rendus sous forme de SVG inline et
  s'impriment correctement.

## Limite connue

- Les polices d'icônes et certains effets CSS peuvent ne pas s'afficher
  correctement selon les navigateurs/imprimantes.
- Les images hébergées sur un domaine tiers peuvent être bloquées par les
  politiques CSP lors de l'impression.
