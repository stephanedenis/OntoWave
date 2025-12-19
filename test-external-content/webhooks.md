# Webhooks

## Vue d'ensemble

Les webhooks permettent de recevoir des notifications en temps réel.

## Configuration

1. Créez un endpoint HTTPS sur votre serveur
2. Configurez l'URL dans votre dashboard
3. Validez le secret partagé

## Événements disponibles

- `user.created` - Nouvel utilisateur
- `user.updated` - Utilisateur modifié
- `user.deleted` - Utilisateur supprimé
- `payment.success` - Paiement réussi
- `payment.failed` - Paiement échoué

## Format de payload

```json
{
  "event": "user.created",
  "timestamp": "2025-12-18T10:00:00Z",
  "data": {
    "id": 123,
    "name": "John Doe"
  },
  "signature": "sha256=..."
}
```

## Sécurité

Vérifiez toujours la signature HMAC :

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

**Source externe** : Port 8011 avec CORS ✅
