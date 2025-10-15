#!/usr/bin/env python3
"""Test OntoWave rapide"""

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json

def test_ontowave_rapide():
    print("🧪 Test OntoWave rapide")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Test serveur
    try:
        response = requests.get("http://localhost:8080/test-real-ontowave.html", 
                              timeout=5)
        print(f"✅ Serveur: {response.status_code}")
    except Exception as e:
        print(f"❌ Serveur: {e}")
        return
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("http://localhost:8080/test-real-ontowave.html")
        
        # Attendre OntoWave
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "app"))
        )
        
        # Attendre que le contenu se charge
        WebDriverWait(driver, 15).until(
            lambda d: len(d.find_elements(By.TAG_NAME, "h1")) > 0
        )
        
        # Capturer résultats
        tables = driver.find_elements(By.TAG_NAME, "table")
        rows = driver.find_elements(By.TAG_NAME, "tr") 
        cells = driver.find_elements(By.TAG_NAME, "td")
        
        driver.save_screenshot("ontowave-test-final.png")
        
        print(f"🎯 RÉSULTATS:")
        print(f"   Tables: {len(tables)}")
        print(f"   Lignes: {len(rows)}")
        print(f"   Cellules: {len(cells)}")
        
        # HTML content
        app_content = driver.find_element(By.ID, "app").get_attribute('innerHTML')
        has_demo = 'Démonstration' in app_content
        has_tables = '<table>' in app_content
        
        print(f"   Markdown chargé: {has_demo}")
        print(f"   Tables HTML: {has_tables}")
        
        if len(tables) > 0:
            print("   🎉 SUCCESS: Tableaux détectés!")
        else:
            print("   ❌ FAIL: Aucun tableau")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        if driver:
            driver.save_screenshot("ontowave-test-error.png")
    
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    test_ontowave_rapide()