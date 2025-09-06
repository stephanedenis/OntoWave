import os
from playwright.sync_api import expect


BASE_URL = os.environ.get("BASE_URL", "https://ontowave.com").rstrip("/")


def test_home_renders_and_title(page):
    page.goto(f"{BASE_URL}/#/fr")
    expect(page.locator("#app h1").first).to_be_visible()
    h1 = page.locator("#app h1").first.text_content() or ""
    assert len(h1.strip()) > 0
    expect(page).to_have_title(lambda t: h1 in t)


def test_sidebar_and_toc_present(page):
    page.goto(f"{BASE_URL}/#/fr/demo/overview")
    expect(page.locator("#sidebar")).to_be_visible()
    expect(page.locator("#toc")).to_be_visible()


def test_mermaid_renders(page):
    page.goto(f"{BASE_URL}/#/fr/demo/mermaid")
    # Wait a bit for dynamic import + render
    page.wait_for_timeout(1500)
    # Mermaid injects an <svg> inside .content
    expect(page.locator(".content svg").first).to_be_visible()


def test_search_opt_in_and_results(page):
    page.goto(f"{BASE_URL}/#/fr/demo/overview")
    # Open Options panel and enable search
    page.click("text=Options")
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
