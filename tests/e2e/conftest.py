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
    channel = os.environ.get("BROWSER_CHANNEL", "").strip()  # e.g., "msedge", "chrome"
    exe = os.environ.get("BROWSER_EXECUTABLE", "").strip()
    launch_kwargs = {"headless": True}
    extra_args = os.environ.get("BROWSER_ARGS", "").strip()
    default_args = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    if extra_args:
        launch_kwargs["args"] = default_args + extra_args.split()
    else:
        launch_kwargs["args"] = default_args
    # Prefer an explicit executable if provided or autodetected
    if not exe:
        for cand in [
            "/usr/bin/microsoft-edge-stable",
            "/usr/bin/microsoft-edge",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
        ]:
            if os.path.exists(cand):
                exe = cand
                break
    if exe:
        launch_kwargs["executable_path"] = exe
    elif channel:
        launch_kwargs["channel"] = channel
    browser = playwright.chromium.launch(**launch_kwargs)
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
