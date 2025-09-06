import os
import tempfile
import pathlib
import contextlib
import pytest
from playwright.sync_api import Playwright, sync_playwright, Page


BASE_URL = os.environ.get("BASE_URL", "https://ontowave.com").rstrip("/")
TEST_LOCALE = os.environ.get("TEST_LOCALE", "fr")


@pytest.fixture(scope="session")
def playwright() -> Playwright:
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")
def browser(playwright: Playwright):
    browser = playwright.chromium.launch(headless=True)
    try:
        yield browser
    finally:
        with contextlib.suppress(Exception):
            browser.close()


@pytest.fixture()
def page(browser) -> Page:
    context = browser.new_context(locale=TEST_LOCALE)
    page = context.new_page()
    try:
        yield page
    finally:
        with contextlib.suppress(Exception):
            context.close()


def write_temp_file(name: str, content: str) -> str:
    tmpdir = pathlib.Path(tempfile.gettempdir())
    path = tmpdir / name
    path.write_text(content, encoding="utf-8")
    return str(path)
