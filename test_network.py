#!/usr/bin/env python3
"""Test OntoWave avec monitoring réseau complet"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time


def test_network_activity():
    print("🔍 Test OntoWave - Monitoring réseau complet")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--v=1")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("📍 Chargement page...")
        driver.get("http://localhost:8080/test-real-ontowave.html")
        print(f"   URL initiale: {driver.current_url}")
        
        # Attendre et capturer état par état
        for i in range(8):
            time.sleep(1)
            current_url = driver.current_url
            app_content = driver.find_element(By.ID, "app").get_attribute('innerHTML')
            print(f"   T+{i+1}s: URL={current_url.split('#')[-1] if '#' in current_url else 'racine'}, contenu={len(app_content)} chars")
            
            if app_content:
                print(f"      CONTENU DETECTE: {app_content[:100]}...")
                break
        
        # Capturer tous les logs
        logs = driver.get_log('browser')
        print(f"\n📋 Tous les logs console ({len(logs)}):")
        for log in logs:
            if 'favicon' not in log['message']:
                print(f"   [{log['level']}] {log['message']}")
        
        # Capturer HTML final
        final_html = driver.page_source
        if 'table' in final_html.lower():
            print("\n🎉 HTML contient 'table' !")
        else:
            print("\n❌ Aucun tableau dans le HTML")
            
        # État final #app
        app_final = driver.find_element(By.ID, "app")
        print(f"\n📄 État final #app:")
        print(f"   InnerHTML: {len(app_final.get_attribute('innerHTML'))} chars")
        print(f"   InnerText: '{app_final.text[:100]}...' " if app_final.text else "   InnerText: VIDE")
        
        driver.save_screenshot("network-test.png")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        driver.save_screenshot("network-error.png")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    test_network_activity()