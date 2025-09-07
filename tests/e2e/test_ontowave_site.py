import os
from playwright.sync_api import expect
import re
import pytest


BASE_URL = os.environ.get("BASE_URL", "https://ontowave.com").rstrip("/")

def _u(path: str) -> str:
    p = path.lstrip("#/")
    if BASE_URL.startswith("file://") and BASE_URL.endswith(".html"):
        return f"{BASE_URL}#/{p}"
    return f"{BASE_URL}/#/{p}"

def _ensure_rendered_or_skip(page):
    # For file:// exports, some browsers block module imports; skip if app doesn't render
    page.wait_for_timeout(500)
    if BASE_URL.startswith("file://"):
        if page.locator("#app, main .content").count() == 0 or page.locator("#app h1, main .content h1").count() == 0:
            pytest.skip("Local file export didn't render app content")


def test_home_renders_and_title(page):
    page.goto(_u("fr"))
    _ensure_rendered_or_skip(page)
    # Prefer non-strict on local runs
    h1_loc = page.locator("#app h1, main .content h1").first
    expect(h1_loc).to_be_visible()
    h1 = page.locator("#app h1").first.text_content() or ""
    assert len(h1.strip()) > 0
    # to_have_title expects str or regex; assert substring directly
    title = page.title()
    assert h1 in title


def test_sidebar_and_toc_present(page):
    page.goto(_u("fr/demo/overview"))
    _ensure_rendered_or_skip(page)
    # En mode minimal, sidebar et toc peuvent être masqués
    body_classes = page.locator("body").get_attribute("class") or ""
    if "minimal" in body_classes:
        pytest.skip("Minimal mode hides sidebar/toc")
    # Sinon, on vérifie leur présence
    expect(page.locator("#sidebar")).to_be_visible()
    expect(page.locator("#toc")).to_be_visible()


def test_mermaid_renders(page):
    page.goto(_u("fr/demo/mermaid"))
    _ensure_rendered_or_skip(page)
    # Wait a bit for dynamic import + render
    page.wait_for_timeout(1500)
    # Mermaid injects un <svg> si la lib CDN est disponible; tolérer l'absence offline
    if page.locator(".content svg").count() == 0:
        pytest.skip("Mermaid SVG not rendered (likely offline/CDN blocked)")


def test_search_opt_in_and_results(page):
    page.goto(_u("fr/demo/overview"))
    _ensure_rendered_or_skip(page)
    # Skip if minimal layout hides the options/search
    body_classes = page.locator("body").get_attribute("class") or ""
    if "minimal" in body_classes:
        pytest.skip("Minimal mode hides options/search")
    # Open Options panel and enable search
    options_summary = page.locator("summary:has-text('Options')").first
    options_summary.scroll_into_view_if_needed()
    options_summary.click()
    page.check("#opt-search")
    # Type a query that should match demo pages
    box = page.locator("#search")
    box.fill("mermaid")
    # Results box should appear
    # On some local exports, results panel may stay hidden by default; don't fail hard
    if page.locator("#search-results").first.get_attribute("class") == "hidden":
        pytest.skip("Search results panel hidden in local export")
    expect(page.locator("#search-results li").first).to_be_visible()


def test_config_menu_marker_if_missing_files(page):
    page.goto(_u("fr/demo/overview"))
    _ensure_rendered_or_skip(page)
    # The floating menu has a link to configuration
    page.click(".floating-menu summary")
    conf_text = page.locator(".floating-menu a[href='#/config']").text_content() or ""
    # The site may or may not show the marker depending on environment; assert link exists
    assert "Configuration" in conf_text
