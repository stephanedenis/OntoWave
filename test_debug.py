#!/usr/bin/env python3
"""Test OntoWave avec JavaScript personnalisé pour debug"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time


def test_js_debug():
    print("🐛 Test OntoWave - Debug JavaScript")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("📍 Chargement page...")
        driver.get("http://localhost:8080/test-real-ontowave.html")
        
        # Attendre 3 secondes pour chargement
        time.sleep(3)
        
        # Exécuter JS pour diagnostiquer
        result = driver.execute_script("""
            console.log('=== DIAGNOSTIC ONTOWAVE ===');
            
            // Vérifier si OntoWave s'est chargé
            let diagnostic = {
                windowVars: Object.keys(window).filter(k => k.includes('onto') || k.includes('wave') || k.includes('ONTO')),
                appContent: document.getElementById('app').innerHTML,
                bundleVar: typeof window.__ONTOWAVE_BUNDLE__,
                location: window.location.href,
                scripts: Array.from(document.scripts).map(s => s.src)
            };
            
            console.log('Diagnostic:', diagnostic);
            return diagnostic;
        """)
        
        print(f"🔍 Diagnostic JavaScript:")
        print(f"   Variables OntoWave: {result['windowVars']}")
        print(f"   Bundle var: {result['bundleVar']}")
        print(f"   App content: {len(result['appContent'])} chars")
        print(f"   Location: {result['location']}")
        print(f"   Scripts: {len(result['scripts'])} scripts")
        
        # Tenter d'initialiser manuellement
        init_result = driver.execute_script("""
            try {
                // Chercher OntoWave dans window
                let found = [];
                for (let key in window) {
                    if (key.toLowerCase().includes('onto') || 
                        key.toLowerCase().includes('wave') ||
                        (typeof window[key] === 'function' && window[key].toString().includes('mount'))) {
                        found.push(key);
                    }
                }
                return {success: true, found: found};
            } catch(e) {
                return {success: false, error: e.toString()};
            }
        """)
        
        print(f"🔧 Init manuel: {init_result}")
        
        # Logs console finaux
        logs = driver.get_log('browser')
        print(f"\n📋 Logs console:")
        for log in logs:
            if 'favicon' not in log['message']:
                print(f"   [{log['level']}] {log['message']}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    finally:
        driver.quit()


if __name__ == "__main__":
    test_js_debug()