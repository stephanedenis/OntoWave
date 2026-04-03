# Custom UI

Demonstration of OntoWave's interface customization: title, logo, custom links, CSS.

## Title and Logo Configuration

```javascript
window.ontoWaveConfig = {
    ui: {
        title: "My Documentation",
        subtitle: "Version 2.0",
        logo: "/assets/logo.svg"
    }
};
```

## Custom Navigation Links

```javascript
window.ontoWaveConfig = {
    ui: {
        links: [
            { label: "GitHub", href: "https://github.com/my-project", target: "_blank" },
            { label: "npm", href: "https://npmjs.com/package/my-package", target: "_blank" }
        ]
    }
};
```

## Custom CSS

OntoWave exposes CSS variables for customization:

```css
:root {
    --ow-primary: #0066cc;
    --ow-font-family: 'Courier New', monospace;
    --ow-sidebar-width: 300px;
}
```

## Style Injection

```javascript
window.ontoWaveConfig = {
    ui: {
        customCss: "/assets/my-theme.css"
    }
};
```

## Known Limitations

- SVG logo must be hosted on the same domain (no CORS)
- Not all CSS variables are documented — check the source code for a complete list
