#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests pour les differents modes de configuration des boutons de langue OntoWave
"""

import pytest
from playwright.sync_api import Page, expect
import time


def test_language_buttons_fixed_mode(page: Page):
    """Test mode 'fixed' uniquement"""
    print("🧪 Test mode 'fixed'...")
    
    # HTML avec configuration fixed
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OntoWave Test - Fixed Mode</title>
    </head>
    <body>
        <div id="ontowave-container"></div>
        <script src="dist/ontowave.js"></script>
        <script>
            const config = {
                ui: {
                    languageButtons: "fixed"
                },
                locales: ["fr", "en"]
            };
            window.OntoWave.create('ontowave-container', config);
        </script>
    </body>
    </html>
    """
    
    page.set_content(html_content)
    time.sleep(2)
    
    # Vérifier boutons fixes présents
    fixed_buttons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn')
    expect(fixed_buttons).to_have_count(2)
    print(f"✅ Boutons fixes trouvés: {fixed_buttons.count()}")
    
    # Vérifier boutons menu absents
    menu_buttons = page.locator('.ontowave-menu .ontowave-lang-btn')
    expect(menu_buttons).to_have_count(0)
    print(f"✅ Boutons menu absents: {menu_buttons.count()}")


def test_language_buttons_menu_mode(page: Page):
    """Test mode 'menu' uniquement"""
    print("🧪 Test mode 'menu'...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OntoWave Test - Menu Mode</title>
    </head>
    <body>
        <div id="ontowave-container"></div>
        <script src="dist/ontowave.js"></script>
        <script>
            const config = {
                ui: {
                    languageButtons: "menu"
                },
                locales: ["fr", "en"]
            };
            window.OntoWave.create('ontowave-container', config);
        </script>
    </body>
    </html>
    """
    
    page.set_content(html_content)
    time.sleep(2)
    
    # Ouvrir le menu
    menu_button = page.locator('.ontowave-menu-button')
    menu_button.click()
    time.sleep(1)
    
    # Vérifier boutons menu présents
    menu_buttons = page.locator('.ontowave-menu .ontowave-lang-btn')
    expect(menu_buttons).to_have_count(2)
    print(f"✅ Boutons menu trouvés: {menu_buttons.count()}")
    
    # Vérifier boutons fixes absents
    fixed_buttons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn')
    expect(fixed_buttons).to_have_count(0)
    print(f"✅ Boutons fixes absents: {fixed_buttons.count()}")


def test_language_buttons_both_mode(page: Page):
    """Test mode 'both' - menu ET fixes"""
    print("🧪 Test mode 'both'...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OntoWave Test - Both Mode</title>
    </head>
    <body>
        <div id="ontowave-container"></div>
        <script src="dist/ontowave.js"></script>
        <script>
            const config = {
                ui: {
                    languageButtons: "both"
                },
                locales: ["fr", "en"]
            };
            window.OntoWave.create('ontowave-container', config);
        </script>
    </body>
    </html>
    """
    
    page.set_content(html_content)
    time.sleep(2)
    
    # Vérifier boutons fixes présents
    fixed_buttons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn')
    expect(fixed_buttons).to_have_count(2)
    print(f"✅ Boutons fixes trouvés: {fixed_buttons.count()}")
    
    # Ouvrir le menu
    menu_button = page.locator('.ontowave-menu-button')
    menu_button.click()
    time.sleep(1)
    
    # Vérifier boutons menu présents
    menu_buttons = page.locator('.ontowave-menu .ontowave-lang-btn')
    expect(menu_buttons).to_have_count(2)
    print(f"✅ Boutons menu trouvés: {menu_buttons.count()}")


def test_language_buttons_default_mode(page: Page):
    """Test mode par défaut (fixed)"""
    print("🧪 Test mode par défaut...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OntoWave Test - Default Mode</title>
    </head>
    <body>
        <div id="ontowave-container"></div>
        <script src="dist/ontowave.js"></script>
        <script>
            const config = {
                locales: ["fr", "en"]
                // pas de ui.languageButtons défini
            };
            window.OntoWave.create('ontowave-container', config);
        </script>
    </body>
    </html>
    """
    
    page.set_content(html_content)
    time.sleep(2)
    
    # Par défaut devrait être "fixed"
    fixed_buttons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn')
    expect(fixed_buttons).to_have_count(2)
    print(f"✅ Mode par défaut (fixed) - Boutons fixes trouvés: {fixed_buttons.count()}")
    
    # Vérifier boutons menu absents
    menu_buttons = page.locator('.ontowave-menu .ontowave-lang-btn')
    expect(menu_buttons).to_have_count(0)
    print(f"✅ Mode par défaut (fixed) - Boutons menu absents: {menu_buttons.count()}")


if __name__ == "__main__":
    print("🧪 Tests des modes de configuration des boutons de langue OntoWave")
