# 🧪 Page de Test Minimaliste - Bundle Production

## 📦 Candidat au Déploiement

Cette page teste **exactement** ce que l'utilisateur final aura via NPM/unpkg.

### Fichiers

1. **test-puml-minimal.html** (HTML minimaliste)
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <script src="dist/ontowave.min.js"></script>
   </head>
   <body>
       <div id="ontowave-container"></div>
   </body>
   </html>
   ```

2. **index-minimal.md** (contenu markdown)
   ```markdown
   # Test Minimal - Navigation .puml
   
   Cliquez sur le lien pour voir le diagramme :
   
   [📐 Diagramme d'architecture](architecture.puml)
   
   C'est tout !
   ```

3. **config-minimal.json** (configuration)
   ```json
   {
     "engine": "v1",
     "sources": { "fr": "index-minimal.md" },
     "roots": [{ "base": "/", "root": "/" }],
     "plantuml": {
       "server": "https://www.plantuml.com/plantuml",
       "format": "svg"
     }
   }
   ```

4. **architecture.puml** (diagramme PlantUML)
   - Déjà présent dans le projet

## 🌐 URLs de Test

### Serveur HTTP Simple (port 8092)
```
http://localhost:8092/test-puml-minimal.html
```

### Serveur Vite Dev (port 5173)
```
http://localhost:5173/test-puml-minimal.html
```

## ✅ Tests à Effectuer

### 1. Test Manuel dans le Navigateur
1. Ouvrir : `http://localhost:8092/test-puml-minimal.html`
2. Vérifier que le markdown "Test Minimal" s'affiche
3. Cliquer sur le lien "📐 Diagramme d'architecture"
4. Vérifier que le diagramme SVG PlantUML s'affiche
5. Vérifier le bouton "← Retour"
6. Vérifier la section "Code source PlantUML"

### 2. Test Automatisé Playwright
```bash
npx playwright test tests/e2e/test-bundle-production.spec.cjs --headed
```

## 🎯 Ce Qui Est Testé

✅ Le bundle **ontowave.min.js** (candidat réel au déploiement)  
✅ HTML minimaliste (head: script, body: container vide)  
✅ Chargement markdown depuis config.json  
✅ Navigation vers fichier .puml  
✅ Rendu SVG PlantUML inline  
✅ Boutons et interactions  

## 🚀 Déploiement

Si ce test passe, le bundle **dist/ontowave.min.js** est prêt pour :
- 📦 Publication NPM
- 🌐 Distribution via unpkg.com
- 📄 Utilisation standalone dans n'importe quelle page HTML

## 📝 Notes

- Le bundle minifié **ne nécessite pas** de `#app`
- Il crée son propre container : `#ontowave-container`
- Il charge automatiquement la config depuis `config.json`
- Il supporte le moteur v1 (legacy) avec .puml
