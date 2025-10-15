#!/usr/bin/env python3
"""Test OntoWave avec monitoring console JS et URL"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_ontowave_console():
    print("🧪 Test OntoWave - Monitoring Console JS et URL")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Activer les logs détaillés
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--log-level=0")
    
    driver = None
    console_logs = []
    errors = []
    urls_seen = []
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        
        # Capturer tous les logs console
        def capture_console_logs():
            logs = driver.get_log('browser')
            for log in logs:
                msg = f"[{log['level']}] {log['message']}"
                console_logs.append(msg)
                if log['level'] in ['SEVERE', 'WARNING']:
                    errors.append(msg)
                print(f"   📋 {msg}")
        
        # Aller sur la page initiale
        print("📍 Navigation vers test-real-ontowave.html...")
        driver.get("http://localhost:8080/test-real-ontowave.html")
        urls_seen.append(driver.current_url)
        print(f"   URL initiale: {driver.current_url}")
        
        # Capture initiale
        capture_console_logs()
        driver.save_screenshot("ontowave-console-initial.png")
        
        # Surveiller les changements d'URL pendant 10 secondes
        print("\n🔍 Surveillance URL et console pendant 10 secondes...")
        start_time = time.time()
        while time.time() - start_time < 10:
            current_url = driver.current_url
            if current_url not in urls_seen:
                urls_seen.append(current_url)
                print(f"   🔗 URL changée: {current_url}")
            
            # Capturer nouveaux logs
            capture_console_logs()
            
            # Vérifier si du contenu apparaît
            try:
                app = driver.find_element(By.ID, "app")
                content = app.get_attribute('innerHTML')
                if content and len(content) > 100:
                    print(f"   ✅ Contenu détecté ({len(content)} chars)")
                    break
            except:
                pass
            
            time.sleep(0.5)
        
        # Capture finale
        driver.save_screenshot("ontowave-console-final.png")
        
        # Analyser le contenu final
        try:
            app = driver.find_element(By.ID, "app")
            content = app.get_attribute('innerHTML')
            
            print(f"\n📊 ANALYSE FINALE:")
            print(f"   URL finale: {driver.current_url}")
            print(f"   Contenu app: {len(content)} caractères")
            print(f"   Contenu preview: {content[:200]}...")
            
            # Chercher des éléments HTML spécifiques
            tables = driver.find_elements(By.TAG_NAME, "table")
            h1s = driver.find_elements(By.TAG_NAME, "h1")
            h2s = driver.find_elements(By.TAG_NAME, "h2")
            
            print(f"   Elements trouvés:")
            print(f"     - H1: {len(h1s)}")
            print(f"     - H2: {len(h2s)}")
            print(f"     - Tables: {len(tables)}")
            
            if tables:
                print("   🎉 TABLEAUX DÉTECTÉS!")
                for i, table in enumerate(tables):
                    rows = table.find_elements(By.TAG_NAME, "tr")
                    print(f"     Table {i+1}: {len(rows)} lignes")
                    
        except Exception as e:
            print(f"   ❌ Erreur analyse: {e}")
        
        # Résumé des erreurs
        print(f"\n🚨 ERREURS DÉTECTÉES ({len(errors)}):")
        for error in errors[-5:]:  # Dernières 5 erreurs
            print(f"   {error}")
        
        print(f"\n🔗 URLS VUES ({len(urls_seen)}):")
        for url in urls_seen:
            print(f"   {url}")
            
        print(f"\n📋 TOTAL LOGS CONSOLE: {len(console_logs)}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        if driver:
            driver.save_screenshot("ontowave-console-crash.png")
    
    finally:
        if driver:
            driver.quit()


if __name__ == "__main__":
    test_ontowave_console()