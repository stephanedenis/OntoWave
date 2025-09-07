# E2E tests (Playwright, Python)

## Setup
- Python 3.10+
- Install deps:
  - `pip install -r tests/e2e/requirements.txt`
  - `playwright install` (sans --with-deps si vous n'avez pas sudo)

## Run against local HTTP (recommandé)
1) Servir le dossier `docs/` en HTTP:
	- `python3 -m http.server 8080 --directory docs`
	- ou `npm run serve:docs`
2) Lancer les tests:
	- `pytest -q tests/e2e --base-url http://127.0.0.1:8080`

## Run against production
- `pytest -q tests/e2e --base-url https://ontowave.com`

Notes:
- Les tests détectent l’environnement et tolèrent l’absence de certaines features.
- Évitez file:// pour la parité; préférez un serveur HTTP local.
