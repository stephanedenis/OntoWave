#!/usr/bin/env python3
"""Test OntoWave avec module ES6 correct"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time


def test_module_version():
    print("🌊 Test OntoWave - Version module ES6")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("📍 Chargement version module...")
        driver.get("http://localhost:8080/test-module-ontowave.html")
        
        # Attendre plus longtemps pour les modules ES6
        for i in range(10):
            time.sleep(1)
            url = driver.current_url
            app_content = driver.find_element(By.ID, "app").get_attribute('innerHTML')
            print(f"   T+{i+1}s: {len(app_content)} chars")
            
            if app_content:
                print(f"🎉 CONTENU TROUVÉ: {app_content[:200]}...")
                
                # Chercher les tableaux
                if '<table>' in app_content:
                    print("🎯 TABLEAUX TROUVÉS!")
                    print("✅ FIX VALIDÉ - Les tableaux marchent!")
                    
                    # Capturer une preuve
                    tables = driver.find_elements(By.TAG_NAME, "table")
                    print(f"📊 Nombre de tableaux: {len(tables)}")
                    
                    if tables:
                        first_table = tables[0].get_attribute('outerHTML')
                        print(f"📋 Premier tableau: {first_table[:300]}...")
                    
                    return True
                else:
                    print("📝 Contenu sans tableaux")
                break
        
        # Vérifier les logs console
        logs = driver.get_log('browser')
        print(f"\n📋 Console logs:")
        for log in logs:
            if 'favicon' not in log['message']:
                print(f"   [{log['level']}] {log['message']}")
        
        driver.save_screenshot("module-test.png")
        print("📸 Screenshot: module-test.png")
        
        return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    finally:
        driver.quit()


if __name__ == "__main__":
    success = test_module_version()
    print(f"\n{'🎉 SUCCÈS!' if success else '❌ ÉCHEC'}")