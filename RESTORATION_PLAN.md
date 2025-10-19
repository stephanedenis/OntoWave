# 🔄 Plan de Restauration OntoWave v1.0.0

## État Actuel

**Branche**: `fix/restore-v1.0.0-clean`  
**Commit Base**: `4efe55a` (Préparation finale v1.0.0 - Prêt pour publication NPM)  
**Status**: ✅ Version fonctionnelle restaurée avec menu flottant

## Problème Identifié

La refonte architecture Vite + TypeScript a **corrompu** le système:
- ❌ Menu flottant disparu (signature OntoWave)
- ❌ Bundle passé de 70 Ko à 4.5 Mo
- ❌ HTML minimaliste cassé (cherche éléments inexistants)
- ❌ Comportement changé vs v1.0.0

**Cause**: Commits directs sans suivre le processus `issue → branche → PR`

## Version v1.0.0 Restaurée

### Caractéristiques
- **Bundle**: `dist/ontowave.min.js` (70 Ko)
- **Architecture**: Standalone JavaScript qui CRÉE le DOM dynamiquement
- **HTML requis**: Minimal - juste `<script src="ontowave.min.js"></script>`
- **Menu flottant**: ✅ Présent, draggable, expansible
- **Configuration**: Inline via `window.ontoWaveConfig`

### Fonctionnalités v1.0.0
- ✅ Multilingue (FR/EN) avec détection automatique
- ✅ Menu flottant déplaçable (🌊 signature OntoWave)
- ✅ Panneau de configuration complet
- ✅ Navigation markdown
- ✅ Mermaid diagrams
- ✅ PlantUML diagrams
- ✅ Prism syntax highlighting
- ✅ Responsive design

## Bugfixes Légitimes à Appliquer

### 1. Fix Tableaux Markdown (Issue #22)
**Commit**: `f072562` - Fix: Table alignment CSS injection + NPM automation  
**Problème**: Alignement colonnes tableaux markdown (left/center/right)  
**Solution**: Injection CSS automatique pour `text-align`

**Fichiers concernés**:
- `src/markdown-table-renderer.js` (ou équivalent dans v1.0.0)

**Vérification**:
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |
```

### 2. Fix PlantUML Navigation (Issues récents)
**Commits**: 
- `ce2cb26` - feat: add PlantUML file navigation with inline SVG rendering
- `cf112b7` - feat: integrate PlantUML navigation support in v1 engine

**Problème**: Fichiers `.puml` non supportés + liens dans SVG non cliquables  
**Solution**: 
- Support chargement fichiers `.puml`
- Rendre liens cliquables dans SVG PlantUML

**Fichiers concernés**:
- Code de gestion PlantUML dans le bundle

### 3. Détection Langue Navigateur (Issue récent)
**Commit**: `ad48da6` - feat: implement browser language detection  
**Problème**: Langue par défaut fixe, ignore préférence navigateur  
**Solution**: Lire `navigator.language` et rediriger automatiquement

**Note**: À vérifier si nécessaire - peut être un "nice to have" pas un bugfix

## Bugfixes à IGNORER (Non-légitimes)

- ❌ Migration Vite + TypeScript (changement architecture)
- ❌ Refonte système de build
- ❌ Changements structure HTML
- ❌ Tout ce qui change le comportement de base

## Plan d'Action

### Phase 1: Validation v1.0.0 ✅
- [x] Checkout commit `4efe55a`
- [x] Créer branche `fix/restore-v1.0.0-clean`
- [x] Vérifier bundle 70 Ko
- [x] Tester menu flottant
- [x] Serveur HTTP sur port 8080

### Phase 2: Application Bugfixes
1. **Identifier le code v1.0.0 concerné**
   - Trouver où sont gérés les tableaux markdown
   - Trouver où est géré PlantUML
   
2. **Appliquer Fix Tableaux**
   - Cherry-pick ou recodage manuel
   - Test: tableaux avec alignement
   
3. **Appliquer Fix PlantUML**
   - Support `.puml` files
   - Liens cliquables dans SVG
   - Test: navigation depuis diagrammes

4. **Rebuild Bundle**
   - Vérifier taille reste ~70 Ko
   - Vérifier menu flottant toujours présent

### Phase 3: Tests & Validation
1. Test manuel complet:
   - Menu flottant visible et draggable
   - Navigation entre pages markdown
   - Tableaux avec alignement correct
   - PlantUML avec fichiers `.puml`
   - Liens PlantUML cliquables

2. Tests automatisés (si existants et pertinents):
   - Playwright tests des fonctionnalités de base
   - Pas de régression vs v1.0.0

### Phase 4: Documentation & PR
1. Créer issue pour chaque bugfix si pas existant
2. Commit séparé pour chaque fix:
   ```
   fix: markdown table alignment CSS injection (#22)
   fix: PlantUML .puml file support and clickable links (#XX)
   ```
3. Push branche `fix/restore-v1.0.0-clean`
4. Créer PR avec description détaillée:
   - Contexte: corruption architecture
   - Solution: restauration v1.0.0 + bugfixes ciblés
   - Tests effectués
   - Captures d'écran menu flottant

### Phase 5: Déploiement
1. Merge PR après review
2. Tag version `v1.0.5` (ou `v1.1.0` selon sémantique)
3. Publier sur NPM
4. Mettre à jour https://ontowave.org

## Fichiers Clés v1.0.0

```
dist/ontowave.min.js          # Bundle standalone (70 Ko)
dist/ontowave.js              # Version non-minifiée (103 Ko)
docs/index.html               # Page d'accueil avec config
docs/ontowave.min.js          # Copie du bundle pour déploiement
docs/index.fr.md              # Contenu français
docs/index.en.md              # Contenu anglais
```

## Vérifications Finales

Avant merge PR:
- [ ] Bundle size: ~70 Ko (pas 4.5 Mo)
- [ ] Menu flottant visible sur http://localhost:8080
- [ ] HTML minimal fonctionne: `<script src="ontowave.min.js"></script>`
- [ ] Tableaux markdown alignés correctement
- [ ] Fichiers `.puml` chargés et rendus
- [ ] Liens PlantUML cliquables
- [ ] Pas de régression fonctionnelle vs v1.0.0

## Commandes Utiles

```bash
# Voir différences entre v1.0.0 et HEAD corrompu
git diff 4efe55a..HEAD --stat

# Trouver commits bugfix tableaux
git log --all --grep="table" --oneline

# Trouver commits bugfix PlantUML
git log --all --grep="plantuml\|puml" --oneline -i

# Tester bundle size
ls -lh dist/ontowave.min.js

# Serveur de test
python3 -m http.server 8080 --directory docs
```

## Contacts & Références

- **Version restaurée**: v1.0.0 (commit `4efe55a`)
- **Issues GitHub**: https://github.com/stephanedenis/OntoWave/issues
- **Documentation**: https://ontowave.org
- **Package NPM**: https://www.npmjs.com/package/ontowave

---

**Date Restauration**: 2025-10-19  
**Branche**: `fix/restore-v1.0.0-clean`  
**Status**: 🟢 Version fonctionnelle restaurée, prêt pour application bugfixes
