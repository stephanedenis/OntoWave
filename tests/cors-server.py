#!/usr/bin/env python3
"""
Serveur HTTP simple avec CORS pour tests OntoWave
Sert des fichiers Markdown avec les en-têtes CORS appropriés
Port: 8011
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8011
DIRECTORY = "test-external-content"

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP avec support CORS"""
    
    def __init__(self, *args, **kwargs):
        # Changer le répertoire de base
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        """Ajoute les en-têtes CORS à toutes les réponses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Répond aux requêtes OPTIONS (preflight CORS)"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Gère les requêtes GET avec logs"""
        print(f"[CORS Server] GET {self.path}")
        super().do_GET()
    
    def log_message(self, format, *args):
        """Log personnalisé"""
        print(f"[CORS Server] {format % args}")

def setup_test_content():
    """Crée le contenu de test si nécessaire"""
    Path(DIRECTORY).mkdir(exist_ok=True)
    
    # Fichier 1: Guide API
    api_guide = Path(DIRECTORY) / "api-guide.md"
    if not api_guide.exists():
        api_guide.write_text("""# Guide API Externe

Ceci est un document chargé depuis un serveur externe (port 8011).

## Authentification

L'API utilise des tokens Bearer pour l'authentification.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/endpoint
```

## Endpoints disponibles

- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer un utilisateur
- `GET /users/:id` - Détails d'un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

## Codes de réponse

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 500 | Erreur serveur |

## Exemples

### Créer un utilisateur

```json
POST /users
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Réponse

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-12-18T10:00:00Z"
}
```

---

**Source externe** : Port 8011 avec CORS activé ✅
""")
    
    # Fichier 2: Documentation webhooks
    webhooks = Path(DIRECTORY) / "webhooks.md"
    if not webhooks.exists():
        webhooks.write_text("""# Webhooks

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
""")
    
    # Fichier 3: Dans un sous-dossier
    subfolder = Path(DIRECTORY) / "advanced"
    subfolder.mkdir(exist_ok=True)
    
    rate_limiting = subfolder / "rate-limiting.md"
    if not rate_limiting.exists():
        rate_limiting.write_text("""# Rate Limiting

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
""")
    
    print(f"[Setup] Test content created in {DIRECTORY}/")

def main():
    """Démarre le serveur CORS"""
    setup_test_content()
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"\n🌐 CORS-enabled server running on http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.path.abspath(DIRECTORY)}/")
        print(f"🔓 CORS: Access-Control-Allow-Origin: *")
        print(f"\n📝 Available files:")
        print(f"   - http://localhost:{PORT}/api-guide.md")
        print(f"   - http://localhost:{PORT}/webhooks.md")
        print(f"   - http://localhost:{PORT}/advanced/rate-limiting.md")
        print(f"\n🛑 Press Ctrl+C to stop\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 CORS server stopped")

if __name__ == "__main__":
    main()
