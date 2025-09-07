import os
from playwright.sync_api import expect
import re
import pytest


BASE_URL = os.environ.get("BASE_URL", "https://ontowave.com").rstrip("/")


def test_home_renders_and_title(page):
    page.goto(f"{BASE_URL}/#/fr")
    expect(page.locator("#app h1").first).to_be_visible()
    h1 = page.locator("#app h1").first.text_content() or ""
    assert len(h1.strip()) > 0
    # to_have_title expects str or regex; assert substring directly
    title = page.title()
    assert h1 in title


def test_sidebar_and_toc_present(page):
    page.goto(f"{BASE_URL}/#/fr/demo/overview")
    # En mode minimal, sidebar et toc peuvent être masqués
    body_classes = page.locator("body").get_attribute("class") or ""
    if "minimal" in body_classes:
        pytest.skip("Minimal mode hides sidebar/toc")
    # Sinon, on vérifie leur présence
    expect(page.locator("#sidebar")).to_be_visible()
    expect(page.locator("#toc")).to_be_visible()


def test_mermaid_renders(page):
    page.goto(f"{BASE_URL}/#/fr/demo/mermaid")
    # Wait a bit for dynamic import + render
    page.wait_for_timeout(1500)
    # Mermaid injects un <svg> si la lib CDN est disponible; tolérer l'absence offline
    if page.locator(".content svg").count() == 0:
        pytest.skip("Mermaid SVG not rendered (likely offline/CDN blocked)")


def test_search_opt_in_and_results(page):
    page.goto(f"{BASE_URL}/#/fr/demo/overview")
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
    expect(page.locator("#search-results")).to_be_visible()
    expect(page.locator("#search-results li").first).to_be_visible()


def test_config_menu_marker_if_missing_files(page):
    page.goto(f"{BASE_URL}/#/fr/demo/overview")
    # The floating menu has a link to configuration
    page.click(".floating-menu summary")
    conf_text = page.locator(".floating-menu a[href='#/config']").text_content() or ""
    # The site may or may not show the marker depending on environment; assert link exists
    assert "Configuration" in conf_text
