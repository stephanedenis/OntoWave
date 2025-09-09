import os, pytest
from playwright.sync_api import expect

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080").rstrip('/')

def _u(path: str) -> str:
    p = path.lstrip('#/')
    return f"{BASE_URL}/#/{p}"

@pytest.mark.parametrize("route", ["fr/demo/mermaid", "fr/demo/overview"])  # a page with code + a normal page
@pytest.mark.parametrize("mode", ["html", "md", "split"])  # expected data-view values
def test_view_mode_switch(page, route, mode):
    page.goto(_u(route))
    page.wait_for_timeout(400)
    # Open floating menu to make view toggles visible
    fm_summary = page.locator('.floating-menu summary').first
    if fm_summary.count() == 0:
        pytest.skip('No floating menu present')
    fm_summary.click()
    toggles = page.locator('#view-toggles button.pill')
    expect(toggles.first).to_be_visible()
    # click the right pill
    btn = page.locator(f"#view-toggles button[data-view='{mode}']")
    btn.click()
    # allow hash change + re-render
    page.wait_for_timeout(200)
    # URL hash should include or exclude view parameter
    h = page.evaluate('location.hash')
    if mode == 'html':
        assert 'view=' not in h
    else:
        assert f"view={mode}" in h
    # active class toggled (exactly one active)
    active_count = page.locator('#view-toggles button.pill.active').count()
    assert active_count == 1


def test_export_index_triggers_download(page, tmp_path):
    if BASE_URL.startswith('file://'):
        pytest.skip('No export test on file:// context')
    page.goto(_u('fr/demo/overview'))
    page.wait_for_timeout(400)
    body_classes = page.locator('body').get_attribute('class') or ''
    if 'minimal' in body_classes:
        pytest.skip('Minimal UI hides options panel')
    # open options (header summary)
    opt_summary = page.locator("summary:has-text('Options')").first
    opt_summary.scroll_into_view_if_needed()
    opt_summary.click()
    export_btn = page.locator('#opt-export-index')
    expect(export_btn).to_be_visible()
    with page.expect_download() as dl_info:
        export_btn.click()
    download = dl_info.value
    assert download.suggested_filename == 'search-index.json'
    path = download.path()
    assert path is not None
    # Basic content sanity
    content = open(path, 'rb').read(50)
    assert content.startswith(b'{') or content.startswith(b'[')
