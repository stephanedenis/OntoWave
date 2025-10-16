# 🐛 Problèmes Identifiés et Solutions

## Problème 1: Code brut .puml au lieu du SVG

**Cause**: Le module `plantuml.ts` avec les fonctions `loadPlantUML()` et `renderPlantUMLSVG()` n'est PAS inclus dans le bundle de production.

**Vérification**:
```bash
grep -o "loadPlantUML\|renderPlantUMLSVG" dist/ontowave.min.js
# Résultat: (vide) = fonctions absentes
```

**Solution**: 
1. Le code .puml est dans le legacy (v1) de `src/main.ts`
2. Le build Vite compile bien `src/main.ts` MAIS génère dans `docs/` avec moteur v2
3. Il faut vérifier que le code v1 (legacy) est bien inclus dans le bundle

## Problème 2: Container `<div id="ontowave-container">` requis

**Cause**: Le bundle standalone (`dist/ontowave.min.js`) attend un container pré-existant.

**Solution**: ✅ **CORRIGÉ**
- HTML minimal maintenant: `<body></body>` (vide)
- Le bundle devrait créer le container dynamiquement

## Problème 3: Fichiers de test pas dans docs/

**Solution**: ✅ **CORRIGÉ**
```bash
cp index-minimal.md docs/
cp architecture.puml docs/
cp config-minimal.json docs/config.json
```

## Problème 4: Build docs/ a des 404

**Cause**: Le build cherche des fichiers qui n'existent pas (nav.yml, search-index.json, etc.)

**Erreurs**:
```
❌ Failed to load resource: 404 (File not found)
❌ Failed to load resource: 404 (File not found)
❌ Failed to load resource: 404 (File not found)
❌ Failed to load resource: 404 (File not found)
```

**Solution**: Ces 404 ne sont pas bloquants (fichiers optionnels), mais il faut:
1. Vérifier que `config.json` est bien dans docs/
2. Vérifier que `index-minimal.md` est chargé
3. Vérifier que `architecture.puml` est accessible

## 🔍 Diagnostic Requis

### 1. Vérifier le bundle minifié

```bash
# Le bundle contient-il le code plantuml?
cd /home/stephane/GitHub/Panini/projects/ontowave
grep -i "\.puml" dist/ontowave.min.js | head -c 500

# Le bundle contient-il renderRoute avec le check .puml?
grep -o "endsWith.*puml" dist/ontowave.min.js
```

### 2. Vérifier que le build compile le legacy (v1)

Le problème est probablement que:
- `src/main.ts` a DEUX chemins: v2 (défaut) et v1 (legacy)
- Le code .puml est dans le v1 (ligne 237-295)
- Mais le bundle par défaut utilise v2

**Vérification**:
```typescript
// Dans src/main.ts ligne 15:
const engine = cfg.engine ?? 'v2'  // <-- Défaut v2

// Le code .puml est dans:
} else {
  // Legacy path: import legacy modules dynamically
  const [{ getCurrentRoute, onRouteChange }, { createMd, rewriteLinks }, { loadPlantUML, renderPlantUMLSVG }] = await Promise.all([
    import('./router'),
    import('./markdown'),
    import('./plantuml'),  // <-- Code .puml ici
  ])
```

### 3. Test avec engine='v1' dans config.json

**Solution immédiate**:
```json
{
  "engine": "v1",  // <-- Forcer le moteur v1 avec support .puml
  "sources": { "fr": "index-minimal.md" },
  "roots": [{ "base": "/", "root": "/" }],
  "plantuml": {
    "server": "https://www.plantuml.com/plantuml",
    "format": "svg"
  }
}
```

## ✅ Actions Recommandées

1. **Vérifier le config.json dans docs/**:
   ```bash
   cat docs/config.json
   ```

2. **Rebuilder avec la bonne config**:
   ```bash
   cp config-minimal.json docs/config.json
   npm run build
   ```

3. **Tester la page buildée**:
   ```bash
   xdg-open "http://localhost:8092/docs/"
   # Cliquer sur le lien .puml
   # Vérifier si SVG ou code brut
   ```

4. **Test automatisé**:
   ```bash
   npx playwright test tests/e2e/test-docs-regression.spec.cjs --headed
   ```

## 🎯 Résultat Attendu

Après correction:
- ✅ Page HTML vide (body sans container)
- ✅ Bundle crée le container dynamiquement
- ✅ Markdown index-minimal.md chargé
- ✅ Clic sur lien .puml → SVG PlantUML affiché
- ✅ Pas de code brut
- ✅ Bouton retour fonctionnel
