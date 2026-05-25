#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test rapide pour verifier que les boutons de langue sont seulement dans le menu
"""

import time
from playwright.sync_api import sync_playwright

def test_boutons_menu_seulement():
    """Test que les boutons de langue sont uniquement dans le menu"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("🧪 Test des boutons de langue - Mode menu uniquement")
        
        # Aller sur la page
        page.goto("http://localhost:8080/")
        time.sleep(3)
        
        # Vérifier qu'il N'Y A PAS de boutons fixes
        fixed_buttons = page.locator('.ontowave-fixed-lang-buttons .ontowave-lang-btn')
        fixed_count = fixed_buttons.count()
        print(f"🔍 Boutons fixes trouvés: {fixed_count} (attendu: 0)")
        
        # Ouvrir le menu pour vérifier les boutons dans le menu
        menu_button = page.locator('.ontowave-menu-button')
        if menu_button.count() > 0:
            menu_button.click()
            time.sleep(1)
            
            menu_buttons = page.locator('.ontowave-menu .ontowave-lang-btn')
            menu_count = menu_buttons.count()
            print(f"🔍 Boutons menu trouvés: {menu_count} (attendu: 2)")
            
            if menu_count > 0:
                print("📝 Textes des boutons menu:")
                for i in range(menu_count):
                    text = menu_buttons.nth(i).text_content()
                    print(f"   - {text}")
        
        # Résultat du test
        if fixed_count == 0 and menu_count == 2:
            print("✅ TEST RÉUSSI ! Boutons uniquement dans le menu")
        else:
            print("❌ TEST ÉCHOUÉ ! Boutons mal positionnés")
            
        browser.close()

if __name__ == "__main__":
    test_boutons_menu_seulement()
