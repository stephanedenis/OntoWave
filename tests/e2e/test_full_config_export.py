import os, pytest
from playwright.sync_api import expect

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080").rstrip('/')

# This test suite assumes the server serves public/config-full.json as /config.json
# e.g. by copying or symlinking before running, or via CI artifact step.
# It validates that in non-minimal mode the export index button is visible and functional.

def _u(path: str) -> str:
    p = path.lstrip('#/')
    return f"{BASE_URL}/#/{p}"

@pytest.mark.parametrize("route", ["fr/demo/overview", "fr/demo/mermaid"])  # sample pages
def test_options_panel_and_export_available_full_mode(page, route):
    page.goto(_u(route))
    page.wait_for_timeout(400)
    body_classes = page.locator('body').get_attribute('class') or ''
    if 'minimal' in body_classes:
        pytest.skip('Site unexpectedly in minimal mode; config-full.json not applied')
    # Options summary should be visible
    options_summary = page.locator("summary:has-text('Options')").first
    expect(options_summary).to_be_visible()
    options_summary.click()
    export_btn = page.locator('#opt-export-index')
    expect(export_btn).to_be_visible()
    with page.expect_download() as dl_info:
        export_btn.click()
    download = dl_info.value
    assert download.suggested_filename == 'search-index.json'

