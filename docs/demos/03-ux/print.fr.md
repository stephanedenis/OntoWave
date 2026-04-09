# Export PDF et impression

OntoWave inclut un CSS d'impression optimisé pour produire des PDF propres depuis
n'importe quel navigateur. Le bouton **🖨** dans la barre UX déclenche `window.print()`.

## Éléments masqués à l'impression

Les éléments suivants sont automatiquement masqués (`display: none`) :

| Sélecteur | Élément masqué |
|---|---|
| `#sidebar` | Barre latérale de navigation |
| `#toc` | Table des matières |
| `#site-header` | En-tête du site |
| `#floating-menu` | Menu flottant |
| `.ow-ux-toolbar` | Barre d'outils UX (thème, notes, impression) |
| `.ow-notes-panel` | Panneau de notes |

## Styles d'impression appliqués

```css
@media print {
  body {
    background: white;
    color: black;
    font-size: 12pt;
    line-height: 1.5;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #555;
  }

  pre, code {
    border: 1px solid #ccc;
    background: #f8f8f8;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td, th {
    border: 1px solid #999;
    padding: 4pt 8pt;
  }
}
```

## Exemple de rendu imprimable

Le contenu ci-dessous illustre la qualité d'impression :

### Tableau de données

| Propriété | Type | Valeur par défaut | Description |
|---|---|---|---|
| `themes` | `boolean` | `true` | Active les thèmes de lecture |
| `keyboard` | `boolean` | `true` | Active les raccourcis clavier |
| `notes` | `boolean` | `true` | Active le panneau de notes |
| `prefetch` | `boolean` | `true` | Préchargement Markov des pages |

### Exemple de code

```typescript
// Initialiser le module UX
initUx({
  themes: true,
  keyboard: true,
  notes: true,
  prefetch: true
});
```

### Texte long

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi
tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Mauris placerat eleifend
leo. Quisque sit amet est et sapien ullamcorper pharetra.

> **Note** : les URLs sont automatiquement affichées après les liens lors de l'impression,
> ce qui permet de retrouver les références dans un PDF.

## Déclenchement manuel

```javascript
// Équivalent au bouton 🖨
window.print();
```

## Configuration

Le bouton d'impression fait partie de la barre UX standard. Il est disponible dès que
`ux: true` est présent dans la configuration.

```json
{
  "ux": true
}
```

---

← [Navigation clavier](keyboard) | → [Notes](notes)
