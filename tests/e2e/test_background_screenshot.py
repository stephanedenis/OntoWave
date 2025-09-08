import os, pathlib, pytest
from playwright.sync_api import expect

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080").rstrip('/')

def _u(path: str) -> str:
    p = path.lstrip('#/')
    return f"{BASE_URL}/#/{p}"

@pytest.mark.parametrize("route", ["fr/demo/overview", "fr"])
def test_capture_background(page, route):
    page.goto(_u(route))
    page.wait_for_timeout(800)
    body = page.locator('body')
    expect(body).to_be_visible()
    screenshots_dir = pathlib.Path('tests/artifacts')
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    fname = screenshots_dir / f"bg_{route.replace('/', '_')}.png"
    page.screenshot(path=str(fname), full_page=True)
    print(f"SCREENSHOT_SAVED::{fname}")
