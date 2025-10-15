#!/usr/bin/env python3
"""Test OntoWave - Initialisation manuelle"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time


def test_manual_init():
    print("🔧 Test OntoWave - Tentative d'initialisation manuelle")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("📍 Chargement page...")
        driver.get("http://localhost:8080/test-real-ontowave.html")
        
        # Attendre que les scripts se chargent
        time.sleep(3)
        
        # Tenter d'initialiser manuellement OntoWave
        print("🔧 Tentative d'initialisation manuelle...")
        result = driver.execute_script("""
            console.log('=== TENTATIVE INIT MANUELLE ===');
            
            // 1. Vérifier window.createApp ou Vue
            if (typeof window.createApp !== 'undefined') {
                console.log('Vue 3 détecté, tentative init...');
                try {
                    const app = window.createApp({});
                    app.mount('#app');
                    return {success: true, method: 'Vue 3 createApp'};
                } catch(e) {
                    return {success: false, error: e.toString(), method: 'Vue 3'};
                }
            }
            
            // 2. Vérifier window.Vue (Vue 2)
            if (typeof window.Vue !== 'undefined') {
                console.log('Vue 2 détecté, tentative init...');
                try {
                    new window.Vue({
                        el: '#app'
                    });
                    return {success: true, method: 'Vue 2'};
                } catch(e) {
                    return {success: false, error: e.toString(), method: 'Vue 2'};
                }
            }
            
            // 3. Chercher toute fonction d'initialisation
            let initFunctions = [];
            for (let key in window) {
                if (typeof window[key] === 'function' && 
                    (key.toLowerCase().includes('init') || 
                     key.toLowerCase().includes('mount') ||
                     key.toLowerCase().includes('start'))) {
                    initFunctions.push(key);
                }
            }
            
            return {
                success: false, 
                initFunctions: initFunctions,
                windowKeys: Object.keys(window).filter(k => 
                    !['chrome', 'console', 'document', 'window', 'location'].includes(k)
                ).slice(0, 20)
            };
        """)
        
        print(f"🔧 Résultat init manuelle: {result}")
        
        # Vérifier si ça a marché
        time.sleep(2)
        app_content = driver.find_element(By.ID, "app").get_attribute('innerHTML')
        print(f"📄 Contenu après init: {len(app_content)} chars")
        
        if app_content:
            print(f"✅ SUCCÈS! Contenu: {app_content[:200]}...")
            
            # Chercher les tableaux
            if '<table>' in app_content:
                print("🎉 TABLEAUX TROUVÉS!")
            else:
                print("📝 Pas de tableaux encore")
        else:
            print("❌ Toujours vide")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    test_manual_init()