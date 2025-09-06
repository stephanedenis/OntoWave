# E2E tests (Playwright Python)

Prereqs:
- Python 3.10+
- `pip install -r tests/e2e/requirements.txt`
- Then: `playwright install --with-deps`

Run:
- `pytest -q tests/e2e -k e2e --base-url https://ontowave.com`

Notes:
- Tests use Playwright page fixture from `pytest-playwright`.
- Default base URL is https://ontowave.com if `--base-url` omitted.
