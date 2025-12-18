# Test des boutons de langue OntoWave

## Mode Fixed (par défaut)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Fixed</title>
</head>
<body>
    <div id="ontowave-container"></div>
    <script src="dist/ontowave.js"></script>
    <script>
        const config = {
            ui: { languageButtons: "fixed" },
            locales: ["fr", "en"]
        };
        window.OntoWave.create('ontowave-container', config);
    </script>
</body>
</html>
```

## Mode Menu
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Menu</title>
</head>
<body>
    <div id="ontowave-container"></div>
    <script src="dist/ontowave.js"></script>
    <script>
        const config = {
            ui: { languageButtons: "menu" },
            locales: ["fr", "en"]
        };
        window.OntoWave.create('ontowave-container', config);
    </script>
</body>
</html>
```

## Mode Both
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Both</title>
</head>
<body>
    <div id="ontowave-container"></div>
    <script src="dist/ontowave.js"></script>
    <script>
        const config = {
            ui: { languageButtons: "both" },
            locales: ["fr", "en"]
        };
        window.OntoWave.create('ontowave-container', config);
    </script>
</body>
</html>
```
