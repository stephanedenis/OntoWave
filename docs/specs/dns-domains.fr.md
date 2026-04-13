# Configuration DNS — Double domaine ontowave.org + ontowave.com

> Version : 1.0 — avril 2026  
> Statut : **documenté**

## Contexte

GitHub Pages ne supporte qu'un seul domaine personnalisé primaire (fichier `docs/CNAME`). Le domaine canonique du site est **`ontowave.org`**. Le domaine `ontowave.com` est configuré côté registrar pour rediriger vers `ontowave.org`.

## Configuration actuelle

### Fichier `docs/CNAME`

```
ontowave.org
```

Ce fichier indique à GitHub Pages de servir le site sous `ontowave.org`. GitHub Pages provisionnera automatiquement le certificat SSL pour ce domaine.

### Enregistrement DNS côté registrar

| Domaine | Type | Valeur | Rôle |
|---|---|---|---|
| `ontowave.org` | A / ALIAS | IP GitHub Pages (`185.199.108.153`, etc.) | Domaine primaire |
| `www.ontowave.org` | CNAME | `stephanedenis.github.io` | Alias www |
| `ontowave.com` | CNAME | `ontowave.org` | Redirection vers le domaine canonique |

> **Note** : La redirection de `ontowave.com` vers `ontowave.org` est gérée au niveau DNS (CNAME registrar). Il ne faut pas configurer `ontowave.com` comme domaine GitHub Pages — cela provoquerait un conflit de CNAME.

## Lien canonique SEO

Pour éviter le contenu dupliqué entre les deux domaines, `docs/index.html` doit contenir :

```html
<link rel="canonical" href="https://ontowave.org/">
```

Ce tag indique aux moteurs de recherche que `https://ontowave.org/` est l'URL de référence, même si le site est accessible depuis `ontowave.com`.

## SSL / HTTPS

- GitHub Pages gère le certificat SSL pour `ontowave.org` automatiquement (Let's Encrypt).
- `ontowave.com` hérite du certificat `ontowave.org` via la redirection CNAME DNS.
- Si `ontowave.com` génère une erreur SSL, il faut vérifier que le CNAME registrar pointe bien vers `ontowave.org` (et non vers `stephanedenis.github.io` directement).

## Vérification

Pour valider la configuration :

```bash
# Vérifier la résolution DNS de ontowave.com
dig CNAME ontowave.com

# Vérifier que ontowave.com redirige bien vers ontowave.org
curl -v https://ontowave.com/ 2>&1 | grep -E "Location|HTTP/"
```

## À ne pas faire

- Ne pas ajouter `ontowave.com` dans `docs/CNAME` — GitHub Pages ne supporte qu'un domaine primaire.
- Ne pas héberger deux copies distinctes du site.
- Ne pas configurer un CNAME `ontowave.com` → `stephanedenis.github.io` directement (contournement GitHub Pages qui peut casser le SSL).
