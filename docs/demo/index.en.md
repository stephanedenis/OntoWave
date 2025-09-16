# Advanced OntoWave Configuration

This page demonstrates an advanced configuration with complete multilingual system.

## Enabled Features

- **Bilingual interface**: French/English with automatic detection
- **Language buttons**: Available both fixed AND in menu (`both`)
- **Adaptive theme**: Follows system preferences (`auto`)
- **Title display**: OntoWave header visible

## Configuration Used

```javascript
window.OntoWaveConfig = {
    ui: {
        languageButtons: 'both',
        showTitle: true,
        theme: 'auto'
    },
    content: {
        supportedLanguages: ['fr', 'en'],
        defaultLanguage: 'fr'
    }
};
```

## Feature Testing

- **Language buttons**: Try the FR/EN buttons to change language
- **OntoWave menu**: Click the 🌊 icon to access options
- **Responsive interface**: Resize window to see adaptation

## Multilingual Navigation

The system automatically detects preferred language and switches the complete interface. All OntoWave menu texts adapt to the selected language.

This configuration is ideal for multilingual sites requiring a complete interface.
