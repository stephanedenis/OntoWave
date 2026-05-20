# UI personnalisée

Démonstration de la personnalisation de l'interface OntoWave : titre, logo, liens personnalisés, CSS.

## Configuration du titre et logo

```javascript
window.ontoWaveConfig = {
    ui: {
        title: "Ma Documentation",
        subtitle: "Version 2.0",
        logo: "/assets/logo.svg"
    }
};
```

## Liens de navigation personnalisés

```javascript
window.ontoWaveConfig = {
    ui: {
        links: [
            { label: "GitHub", href: "https://github.com/mon-projet", target: "_blank" },
            { label: "npm", href: "https://npmjs.com/package/mon-package", target: "_blank" }
        ]
    }
};
```

## CSS personnalisé

OntoWave expose des variables CSS pour la personnalisation :

```css
:root {
    --ow-primary: #0066cc;
    --ow-font-family: 'Courier New', monospace;
    --ow-sidebar-width: 300px;
}
```

## Injection de styles

```javascript
window.ontoWaveConfig = {
    ui: {
        customCss: "/assets/my-theme.css"
    }
};
```

## Limite connue

- Le logo SVG doit être hébergé sur le même domaine (pas de CORS)
- Les variables CSS ne sont pas toutes documentées — consulter le code source pour la liste complète
