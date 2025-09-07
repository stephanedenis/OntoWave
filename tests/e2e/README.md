# E2E tests (Playwright, Python)

## Setup
- Python 3.10+
- Install deps:
	- `pip install -r tests/e2e/requirements.txt`
	- `playwright install --with-deps`

## Run against production
By default, tests target https://ontowave.com via the `BASE_URL` env in tests.

Run all tests:
- `pytest -q tests/e2e`

Override the target:
- `BASE_URL=https://ontowave.com pytest -q tests/e2e`

## Run against a local file:// export (optional)
- Build your static site and locate its `index.html` path, e.g.: `file:///home/you/ontowave/docs/index.html`
- Run: `BASE_URL=file:///home/you/ontowave/docs/index.html pytest -q tests/e2e`

Notes:
- Tests use the Playwright `page` fixture from `pytest-playwright`.
- `BASE_URL` is read inside tests; there's no `--base-url` CLI option used here.
