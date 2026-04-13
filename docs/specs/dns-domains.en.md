# DNS Configuration — Dual Domain ontowave.org + ontowave.com

> Version: 1.0 — April 2026  
> Status: **documented**

## Context

GitHub Pages only supports a single primary custom domain (the `docs/CNAME` file). The canonical domain of the site is **`ontowave.org`**. The `ontowave.com` domain is configured at the registrar level to redirect to `ontowave.org`.

## Current Configuration

### `docs/CNAME` file

```
ontowave.org
```

This file tells GitHub Pages to serve the site under `ontowave.org`. GitHub Pages will automatically provision the SSL certificate for this domain.

### DNS Records at Registrar

| Domain | Type | Value | Role |
|---|---|---|---|
| `ontowave.org` | A / ALIAS | GitHub Pages IPs (`185.199.108.153`, etc.) | Primary domain |
| `www.ontowave.org` | CNAME | `stephanedenis.github.io` | www alias |
| `ontowave.com` | CNAME | `ontowave.org` | Redirect to canonical domain |

> **Note**: The redirect from `ontowave.com` to `ontowave.org` is handled at the DNS level (registrar CNAME). Do not configure `ontowave.com` as a GitHub Pages domain — this would cause a CNAME conflict.

## SEO Canonical Link

To prevent duplicate content between the two domains, `docs/index.html` must contain:

```html
<link rel="canonical" href="https://ontowave.org/">
```

This tag tells search engines that `https://ontowave.org/` is the reference URL, even if the site is accessible from `ontowave.com`.

## SSL / HTTPS

- GitHub Pages manages the SSL certificate for `ontowave.org` automatically (Let's Encrypt).
- `ontowave.com` inherits the `ontowave.org` certificate via the DNS CNAME redirect.
- If `ontowave.com` generates an SSL error, verify that the registrar CNAME points to `ontowave.org` (not directly to `stephanedenis.github.io`).

## Verification

To validate the configuration:

```bash
# Verify DNS resolution of ontowave.com
dig CNAME ontowave.com

# Verify that ontowave.com correctly redirects to ontowave.org
curl -v https://ontowave.com/ 2>&1 | grep -E "Location|HTTP/"
```

## What Not to Do

- Do not add `ontowave.com` to `docs/CNAME` — GitHub Pages only supports a single primary domain.
- Do not host two separate copies of the site.
- Do not configure a CNAME `ontowave.com` → `stephanedenis.github.io` directly (a GitHub Pages workaround that can break SSL).
