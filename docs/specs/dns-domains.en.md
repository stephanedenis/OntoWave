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
| `ontowave.com` | CNAME | `ontowave.org` | DNS alias toward the canonical host |

> **Note**: A DNS `CNAME` only aliases name resolution. It does **not** create an HTTP `301/302` redirect by itself and does **not** guarantee HTTPS for `ontowave.com`. If `ontowave.com` must redirect at the HTTP level, that behavior must be provided by the registrar's web forwarding service or by infrastructure serving `ontowave.com` with a valid certificate. Do not configure `ontowave.com` as a GitHub Pages domain unless you intentionally want GitHub Pages to serve that hostname too.

## SEO Canonical Link

To prevent duplicate content between the two domains, `docs/index.html` must contain:

```html
<link rel="canonical" href="https://ontowave.org/">
```

This tag tells search engines that `https://ontowave.org/` is the reference URL, even if the site is accessible from `ontowave.com`.

## SSL / HTTPS

- GitHub Pages manages the SSL certificate for `ontowave.org` automatically (Let's Encrypt).
- A certificate for `ontowave.org` does **not** automatically cover `ontowave.com` just because DNS uses a `CNAME`.
- If `https://ontowave.com/` must be reachable, the endpoint serving that hostname must present a certificate valid for `ontowave.com`.
- If `ontowave.com` is only intended as a DNS alias and not as an HTTPS entrypoint, do not rely on `https://ontowave.com/` for verification.

## Verification

To validate the configuration:

```bash
# Verify DNS aliasing of ontowave.com
dig +short CNAME ontowave.com

# If the registrar provides an actual HTTP redirect, verify the status and Location header explicitly
curl -I http://ontowave.com/
curl -I https://ontowave.com/

# If HTTPS is expected on ontowave.com, verify the served certificate covers that hostname
openssl s_client -connect ontowave.com:443 -servername ontowave.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -ext subjectAltName
```

Expected results depend on the chosen setup:

- **DNS alias only**: `dig` returns `ontowave.org.` and there may be no HTTP `Location` header at all.
- **HTTP forwarding enabled**: `curl -I` shows a `301` or `302` with `Location: https://ontowave.org/`.
- **HTTPS served on `ontowave.com`**: the certificate output must include `ontowave.com` in the SAN list.

## What Not to Do

- Do not add `ontowave.com` to `docs/CNAME` — GitHub Pages only supports a single primary domain.
- Do not host two separate copies of the site.
- Do not configure a CNAME `ontowave.com` → `stephanedenis.github.io` directly (a GitHub Pages workaround that can break SSL).
