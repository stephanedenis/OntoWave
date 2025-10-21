#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test simple OntoWave après reconstruction
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

def test_ontowave_simple():
    """Test OntoWave basique avec gestion des erreurs"""
    
    # Configuration Chrome
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        
        # Charger la page index.html
        file_path = os.path.abspath("docs/index.html")
        driver.get("file://" + file_path)
        
        print("Page chargee, attente initialisation...")
        time.sleep(2)
        
        # Verifier les erreurs JS
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if errors:
            print("Erreurs JavaScript:")
            for error in errors:
                print("  - " + str(error['message']))
            return False
        
        # Verifier que OntoWave existe
        ontowave_exists = driver.execute_script("return typeof window.OntoWave !== 'undefined'")
        print("OntoWave existe: " + str(ontowave_exists))
        
        # Verifier l'etat de la page
        title = driver.title
        print("Titre: " + str(title))
        
        # Verifier le contenu
        body_text = driver.find_element(By.TAG_NAME, "body").text
        print("Contenu present: " + str(len(body_text) > 0))
        
        print("Test OntoWave reussi!")
        return True
        
    except Exception as e:
        print("Erreur lors du test: " + str(e))
        return False
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    success = test_ontowave_simple()
    exit(0 if success else 1)