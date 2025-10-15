#!/usr/bin/env python3
"""
Test OntoWave avec Python - captures d'écran et logs
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json

def test_ontowave_tableaux():
    print("🧪 Test OntoWave tableaux avec Python + Selenium")
    
    # Configuration Chrome headless
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Vérifier que le serveur répond
    try:
        response = requests.get("http://localhost:8080/test-fix-tableaux.html", 
                              timeout=5)
        print(f"✅ Serveur accessible - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Serveur inaccessible: {e}")
        return
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        
        # Capturer les logs console
        driver.execute_cdp_cmd('Runtime.enable', {})
        console_logs = []
        
        def capture_console(message):
            console_logs.append(f"{message['level']}: {message['text']}")
        
        # Aller sur la page
        print("📍 Navigation vers test-fix-tableaux.html...")
        driver.get("http://localhost:8080/test-fix-tableaux.html")
        
        # Attendre que la page se charge
        time.sleep(2)
        
        # Capture d'écran initiale
        driver.save_screenshot("test-ontowave-initial.png")
        print("📸 Capture initiale sauvée")
        
        # Vérifier l'élément app (OntoWave utilise #app)
        try:
            content_div = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "app"))
            )
            print("✅ Élément #app trouvé")
        except Exception:
            print("❌ Élément #app non trouvé")
            driver.save_screenshot("test-ontowave-error.png")
            return
        
        # Attendre que le contenu se charge
        time.sleep(3)
        
        # Capture finale
        driver.save_screenshot("test-ontowave-final.png")
        print("📸 Capture finale sauvée")
        
        # Vérifier le contenu HTML
        content_html = content_div.get_attribute('innerHTML')
        print(f"📄 Contenu HTML (premiers 200 chars): {content_html[:200]}...")
        
        # Chercher des tableaux
        tables = driver.find_elements(By.TAG_NAME, "table")
        rows = driver.find_elements(By.TAG_NAME, "tr")
        cells = driver.find_elements(By.TAG_NAME, "td")
        
        print(f"🔍 Éléments trouvés:")
        print(f"   - Tables: {len(tables)}")
        print(f"   - Lignes (tr): {len(rows)}")
        print(f"   - Cellules (td): {len(cells)}")
        
        # Récupérer les logs JavaScript
        logs = driver.get_log('browser')
        print(f"📋 Logs console ({len(logs)} entrées):")
        for log in logs:
            print(f"   {log['level']}: {log['message']}")
        
        # Tester le chargement du markdown avec OntoWave
        try:
            script_result = driver.execute_script("""
                const app = document.getElementById('app');
                return {
                    contentLength: app ? app.innerHTML.length : 0,
                    hasMarkdown: app ? app.innerHTML.includes('Démonstration') : false,
                    hasTables: app ? app.innerHTML.includes('<table>') : false,
                    url: window.location.href
                };
            """)
            print(f"🎯 Résultats JavaScript: {json.dumps(script_result, indent=2)}")
        except Exception as e:
            print(f"❌ Erreur JavaScript: {e}")
        
        # Résumé final
        print("\n🎯 RÉSUMÉ DU TEST:")
        print(f"   ✅ Page chargée: {driver.current_url}")
        print(f"   ✅ #app présent: {content_div is not None}")
        print(f"   📊 Tables HTML: {len(tables)}")
        print(f"   📊 Lignes: {len(rows)}")
        print(f"   📊 Cellules: {len(cells)}")
        
        if len(tables) > 0:
            print("   🎉 TABLEAUX DÉTECTÉS !")
        elif len(rows) > 0:
            print("   ⚠️  Lignes TR détectées mais pas de TABLE")
        else:
            print("   ❌ Aucun tableau détecté")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        if driver:
            driver.save_screenshot("test-ontowave-crash.png")
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    test_ontowave_tableaux()