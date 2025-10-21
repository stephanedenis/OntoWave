# Guide de Test OntoWave

## 🎯 Architecture de Test

### Production vs Test

**Production (ontowave.org)** :
```
https://ontowave.org/
├── demos/           ← baseUrl: '/demos/'
├── index.md
└── README.md
```

**Test local** :
```
http://localhost:8080/
├── demos/           ← baseUrl: '/demos/' (identique)
├── index.md
└── README.md
```

**⚠️ IMPORTANT** : Le serveur de test doit **toujours** servir depuis `/docs` comme racine pour reproduire l'environnement de production.

---

## 🚀 Démarrer le Serveur de Test

### Méthode 1 : Script dédié (recommandé)

```bash
./scripts/start-test-server.sh [port]
```

Par défaut sur port 8080. Le script :
- Tue les anciens serveurs sur le port
- Démarre depuis `/docs` comme racine
- Affiche toutes les URLs de test

### Méthode 2 : Manuel

```bash
cd docs
python3 -m http.server 8080
```

**❌ NE PAS faire** :
```bash
# MAUVAIS - serveur à la racine du projet
python3 -m http.server 8080

# MAUVAIS - serveur ailleurs que /docs
cd src && python3 -m http.server 8080
```

---

## 🧪 Exécuter les Tests

### Tests E2E (Playwright)

**Avant de lancer les tests** :
```bash
# 1. Démarrer le serveur de test
cd docs
python3 -m http.server 8080 &

# 2. Lancer les tests
npx playwright test
```

**Tests spécifiques** :
```bash
# SVG inline validation (8 tests)
npx playwright test tests/e2e/svg-inline-validation.spec.js

# Toutes les démos
npx playwright test tests/e2e/demo-*.spec.js

# Rapport HTML
npx playwright test --reporter=html
npx playwright show-report
```

### Configuration des Tests

Les tests **doivent** utiliser :
```javascript
const BASE_URL = 'http://localhost:8080';

// ✅ CORRECT
await page.goto(`${BASE_URL}/demos/01-plantuml-minimal.html`);

// ❌ INCORRECT
await page.goto('http://localhost:8000/docs/demos/...');
```

---

## 📋 Checklist Avant Commit

- [ ] Serveur de test démarre depuis `/docs`
- [ ] `baseUrl: '/demos/'` dans tous les fichiers HTML (PAS `/docs/demos/`)
- [ ] Tests Playwright utilisent `http://localhost:8080`
- [ ] README.md présent dans `/docs/README.md`
- [ ] Tous les tests passent (8/8 pour svg-inline)

---

## 🔧 Résolution de Problèmes

### Les liens de navigation ne marchent pas

**Symptôme** : Cliquer sur un lien → 404

**Cause** : Serveur non démarré depuis `/docs`

**Solution** :
```bash
pkill -f "http.server 8080"
cd docs
python3 -m http.server 8080 &
```

### Tests en échec "net::ERR_CONNECTION_REFUSED"

**Cause** : Serveur non démarré

**Solution** :
```bash
cd docs && python3 -m http.server 8080 &
```

### baseUrl incorrect dans les démos

**Si vous voyez** : `baseUrl: '/docs/demos/'`  
**Corriger en** : `baseUrl: '/demos/'`

Production (ontowave.org) sert `/docs` comme racine, donc `/demos/` est le bon chemin.

---

## 📊 Validation Finale

```bash
# 1. Serveur
cd docs && python3 -m http.server 8080 &

# 2. Tests manuels
open http://localhost:8080/demos/09-mermaid-flowcharts.html
# Cliquer sur lien "README.md" en bas de page → doit fonctionner

# 3. Tests automatiques
npx playwright test tests/e2e/svg-inline-validation.spec.js

# 4. Vérifier tous les liens
for demo in docs/demos/*.html; do
  curl -s -o /dev/null -w "%{http_code} $demo\n" \
    "http://localhost:8080/demos/$(basename $demo)"
done
```

---

## 🎯 Note Importante

**La règle d'or** : Le serveur de test doit **reproduire exactement** l'environnement de production.

✅ Production = `/docs` comme racine → Test = `/docs` comme racine  
✅ Production = `baseUrl: '/demos/'` → Test = `baseUrl: '/demos/'`

**Ne jamais** adapter la configuration OntoWave aux tests, mais **adapter les tests** à la configuration de production.
