# 🌐 Sources de Données Externes et CORS

## Vue d'ensemble

OntoWave permet maintenant de charger du contenu Markdown depuis des serveurs externes grâce au support CORS intégré. Cette fonctionnalité vous permet de :

- ✅ Référencer des fichiers `.md` hébergés sur d'autres domaines
- ✅ Agréger du contenu de plusieurs sources
- ✅ Intégrer des API de documentation externes
- ✅ Centraliser la navigation tout en distribuant le contenu

## 🚀 Démarrage rapide

### 1. Configuration basique

Ajoutez une source externe dans votre `config.json` :

```json
{
  "externalDataSources": [
    {
      "name": "api-docs",
      "baseUrl": "https://api.example.com/docs",
      "corsEnabled": true
    }
  ]
}
```

### 2. Référencement dans vos documents

Utilisez la syntaxe `@sourceName/path` :

```markdown
Consultez la [documentation API](@api-docs/endpoints.md)
```

### 3. Navigation directe

Accédez directement via l'URL :

```
https://your-site.com/#@api-docs/endpoints
```

## 📚 Cas d'usage

### Documentation API distante

```json
{
  "externalDataSources": [{
    "name": "api",
    "baseUrl": "https://api.example.com/docs",
    "corsEnabled": true,
    "headers": {
      "Authorization": "Bearer YOUR_TOKEN"
    }
  }]
}
```

Dans votre markdown :
```markdown
# Guide d'intégration

Voir aussi :
- [Authentification](@api/auth.md)
- [Endpoints REST](@api/rest-api.md)
- [Webhooks](@api/webhooks.md)
```

### Wiki d'entreprise

```json
{
  "externalDataSources": [{
    "name": "wiki",
    "baseUrl": "https://wiki.company.com/md",
    "corsEnabled": true
  }]
}
```

### GitHub Pages externe

```json
{
  "externalDataSources": [{
    "name": "shared",
    "baseUrl": "https://your-org.github.io/shared-docs",
    "corsEnabled": true
  }]
}
```

## ⚙️ Configuration avancée

### Paramètres disponibles

| Paramètre | Type | Description |
|-----------|------|-------------|
| `name` | string | Identifiant unique (utilisé dans `@name/...`) |
| `baseUrl` | string | URL de base du serveur |
| `corsEnabled` | boolean | Active le mode CORS (recommandé) |
| `headers` | object | En-têtes HTTP personnalisés |

### Exemple complet

```json
{
  "roots": [
    { "base": "fr", "root": "/docs" },
    { "base": "en", "root": "/docs" }
  ],
  "externalDataSources": [
    {
      "name": "api",
      "baseUrl": "https://api.example.com/docs",
      "corsEnabled": true,
      "headers": {
        "Authorization": "Bearer abc123",
        "X-Custom-Header": "OntoWave"
      }
    },
    {
      "name": "wiki",
      "baseUrl": "https://wiki.example.com/content",
      "corsEnabled": true
    }
  ]
}
```

## 🔧 Configuration serveur CORS

### En-têtes requis

Votre serveur externe doit renvoyer ces en-têtes HTTP :

```
Access-Control-Allow-Origin: https://your-ontowave-site.com
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Configuration Apache

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

### Configuration Nginx

```nginx
location /docs {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}
```

### Configuration Express.js

```javascript
app.use('/docs', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

## 🐛 Débogage

### Messages console

OntoWave affiche des messages utiles dans la console :

```javascript
// Configuration réussie
[OntoWave] External data sources configured: api, wiki

// Erreur de chargement
[OntoWave] Failed to fetch external content: https://api.example.com/docs/test.md (404 Not Found)

// Erreur CORS
[OntoWave] CORS error fetching https://api.example.com/docs/test.md. 
Ensure the server has proper CORS headers or enable CORS in config.
```

### Vérification rapide

1. **Ouvrir la console** (F12)
2. **Naviguer vers un lien externe**
3. **Vérifier les messages**

### Tests manuels

Testez votre URL externe directement :

```bash
# Vérifier les en-têtes CORS
curl -I -H "Origin: https://your-site.com" https://api.example.com/docs/test.md

# Devrait afficher :
# Access-Control-Allow-Origin: *
```

## 🔒 Sécurité

### ⚠️ Bonnes pratiques

1. **Ne committez jamais de tokens** dans le repository
2. **Utilisez HTTPS** pour toutes les sources externes
3. **Limitez CORS** aux domaines de confiance en production
4. **Tokens avec permissions minimales** seulement

### Variables d'environnement

```javascript
// build.js
const config = {
  externalDataSources: [{
    name: "api",
    baseUrl: process.env.API_URL,
    corsEnabled: true,
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`
    }
  }]
}
```

## 📖 Documentation complète

Pour plus de détails, consultez :

- [Guide technique CORS](../technical/development/EXTERNAL-SOURCES-CORS.md)
- [Configuration exemple](../config-with-external-sources.json)
- [Architecture OntoWave](../panini/fractal-architecture.md)

## 🎯 Exemples pratiques

### Scénario 1 : Documentation distribuée

```
Site principal (ontowave.com)
  ├── Guide utilisateur (local)
  ├── API Reference (@api-docs)
  └── Tutoriels (@wiki)
```

### Scénario 2 : Multi-équipes

```
Team Frontend → https://frontend.company.com/docs
Team Backend  → https://backend.company.com/docs
Team DevOps   → https://devops.company.com/docs

OntoWave central → Agrège tout
```

### Scénario 3 : Open Source

```
Documentation principale (GitHub Pages)
  └── Intègre des docs communautaires externes
      ├── @plugins (plugins.example.com)
      ├── @themes (themes.example.com)
      └── @extensions (extensions.example.com)
```

## 🚧 Limitations connues

- **Taille maximale** : Dépend de la connexion réseau
- **Cache** : Utilisé `cache: 'no-cache'` par défaut
- **Mode no-cors** : Si `corsEnabled: false`, les réponses sont opaques
- **Latence** : Le chargement dépend du serveur distant

## ❓ Questions fréquentes

**Q : Puis-je utiliser plusieurs sources externes ?**  
R : Oui, ajoutez autant d'entrées que nécessaire dans `externalDataSources`.

**Q : Fonctionne-t-il avec des API privées ?**  
R : Oui, utilisez le paramètre `headers` pour l'authentification.

**Q : Et si le serveur distant est en panne ?**  
R : OntoWave affiche une page 404 avec un message explicite.

**Q : Puis-je mixer sources locales et externes ?**  
R : Absolument ! OntoWave gère les deux de manière transparente.

---

**Version** : 1.1.0  
**Dernière mise à jour** : Décembre 2025
