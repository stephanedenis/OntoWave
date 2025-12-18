# Test CORS - Page d'accueil locale

Bienvenue sur la page de test CORS OntoWave !

## Navigation

Utilisez les liens ci-dessus pour tester le chargement depuis des sources externes :

### Sources externes (port 8011)

1. **[Guide API](@external-api/api-guide.md)** - Documentation API complète
2. **[Webhooks](@external-api/webhooks.md)** - Configuration des webhooks
3. **[Rate Limiting](@external-api/advanced/rate-limiting.md)** - Gestion des limites

### Source locale (port 8010)

Cette page est servie localement depuis le port 8010.

## Comment ça fonctionne ?

```
┌─────────────────┐         ┌─────────────────┐
│   OntoWave      │         │  Serveur CORS   │
│   Port 8010     │ ◄─────► │   Port 8011     │
│   (Principal)   │  CORS   │   (Externe)     │
└─────────────────┘         └─────────────────┘
```

OntoWave charge :
- **Contenu local** : depuis le serveur principal (8010)
- **Contenu externe** : depuis le serveur CORS (8011) via `@external-api/...`

## Configuration

```json
{
  "externalDataSources": [
    {
      "name": "external-api",
      "baseUrl": "http://localhost:8011",
      "corsEnabled": true
    }
  ]
}
```

## Vérification

Ouvrez la console développeur (F12) pour voir :
- ✅ Messages de configuration des sources externes
- ✅ Logs de chargement CORS
- ❌ Erreurs CORS éventuelles

---

**Status** : 🟢 Test local actif
