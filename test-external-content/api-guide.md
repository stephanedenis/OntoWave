# Guide API Externe

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
