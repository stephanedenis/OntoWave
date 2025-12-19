# Rate Limiting

## Limites

- 100 requêtes par minute pour les endpoints publics
- 1000 requêtes par minute pour les endpoints authentifiés
- 10000 requêtes par heure maximum

## En-têtes de réponse

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Gestion des dépassements

En cas de dépassement, l'API retourne :

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
```

Status code: `429 Too Many Requests`

## Bonnes pratiques

1. Implémentez un backoff exponentiel
2. Respectez l'en-tête `Retry-After`
3. Cachez les réponses quand possible
4. Utilisez des webhooks au lieu de polling

---

**Source externe** : Port 8011 - Sous-dossier advanced/ ✅
