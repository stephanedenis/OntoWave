import os
import re
from playwright.sync_api import expect
import urllib.request


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080").rstrip("/")


def _u(path: str) -> str:
    p = path.lstrip("#/")
    return f"{BASE_URL}/#/{p}"


def test_click_mermaid_from_overview(page):
    # Ouvre l'aperçu des démos en FR
    page.goto(_u("fr/demo/overview"), wait_until="load")
    # Attendre que le contenu se rende
    expect(page.locator("#app h1, main .content h1").first).to_be_visible()
    # Cliquer sur un lien vers /demo/mermaid dans la zone de contenu
    link = page.locator("#app a[href*='/demo/mermaid'], main .content a[href*='/demo/mermaid']").first
    expect(link).to_be_visible()
    link.click()
    # Attendre la navigation (SPA hash) et le changement de titre
    expect(page).to_have_url(re.compile(r"/#/(fr|en)/demo/mermaid(\?.*)?$"), timeout=8000)
    h1 = page.locator("#app h1, main .content h1").first
    expect(h1).to_have_text(re.compile(r"mermaid", re.I), timeout=8000)


def test_mermaid_renders_svg(page):
    # Ouvre la page Mermaid FR
    page.goto(_u("fr/demo/mermaid"), wait_until="load")
    # Attendre que le H1 soit visible
    expect(page.locator("#app h1, main .content h1").first).to_be_visible()
    # Attendre qu'au moins un diagramme mermaid ait été transformé en SVG
    # enhance.ts remplace les blocs pre>code.language-mermaid par <div class="mermaid">...</div> puis exécute mermaid.run
    mermaid_container = page.locator(".mermaid").first
    expect(mermaid_container).to_be_visible(timeout=8000)
    # Quand mermaid a rendu, un <svg> apparaît à l'intérieur
    svg = page.locator(".mermaid svg").first
    expect(svg).to_be_visible(timeout=8000)


def _kroki_online() -> bool:
    try:
        with urllib.request.urlopen("https://kroki.io/health", timeout=3) as r:
            return r.status == 200
    except Exception:
        return False


def test_plantuml_renders_svg_via_kroki(page):
    if not _kroki_online():
        import pytest
        pytest.skip("Kroki unreachable; skipping PlantUML render test")
    page.goto(_u("fr/demo/plantuml"), wait_until="load")
    expect(page.locator("#app h1, main .content h1").first).to_be_visible()
    # enhance.ts remplace pre>code.language-plantuml par un <div class="diagram"><svg ...
    img = page.locator(".diagram img[src^='data:image/svg+xml']").first
    expect(img).to_be_visible(timeout=8000)


def test_relative_link_from_links_page(page):
    # Ouvre la page Liens FR (liens dans la zone de contenu)
    page.goto(_u("fr/demo/links"), wait_until="load")
    expect(page.locator("#app h1, main .content h1").first).to_be_visible()
    # Cliquer sur un lien relatif vers overview.md
    link = page.locator("#app a[href*='overview'], main .content a[href*='overview']").first
    expect(link).to_be_visible()
    link.click()
    # Attendre la navigation et vérifier le titre
    expect(page).to_have_url(re.compile(r"/#/(fr|en)/demo/overview(\?.*)?$"), timeout=8000)
    h1 = page.locator("#app h1, main .content h1").first
    expect(h1).to_have_text(re.compile(r"aperçu|overview", re.I), timeout=8000)
