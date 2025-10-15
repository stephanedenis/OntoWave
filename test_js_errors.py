#!/usr/bin/env python3
"""Test OntoWave rapide - focus erreurs JS"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def test_js_errors():
    print("🧪 Test OntoWave - Focus erreurs JS")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("📍 Chargement page...")
        driver.get("http://localhost:8080/test-real-ontowave.html")
        print(f"   URL: {driver.current_url}")
        
        # Attendre 5 secondes pour OntoWave
        print("⏳ Attente 5 secondes...")
        time.sleep(5)
        
        print(f"   URL finale: {driver.current_url}")
        
        # Capturer logs
        logs = driver.get_log('browser')
        print(f"📋 Console logs ({len(logs)}):")
        js_errors = []
        for log in logs:
            print(f"   [{log['level']}] {log['message']}")
            if 'error' in log['message'].lower() and 'favicon' not in log['message'].lower():
                js_errors.append(log['message'])
        
        # Analyser contenu
        app = driver.find_element(By.ID, "app")
        content = app.get_attribute('innerHTML')
        print(f"📄 Contenu app: {len(content)} chars")
        
        if content:
            print(f"   Preview: {content[:300]}...")
            
            # Chercher tableaux
            if '<table>' in content:
                print("🎉 TABLEAUX TROUVÉS!")
            elif 'Démonstration' in content:
                print("📝 Markdown chargé mais pas de tableaux")
            else:
                print("❌ Contenu inattendu")
        else:
            print("❌ Aucun contenu dans #app")
        
        driver.save_screenshot("js-test-final.png")
        
        if js_errors:
            print(f"🚨 ERREURS JS CRITIQUES:")
            for error in js_errors:
                print(f"   {error}")
        else:
            print("✅ Aucune erreur JS critique")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        driver.save_screenshot("js-test-error.png")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    test_js_errors()