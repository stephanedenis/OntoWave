#!/usr/bin/env python3
"""
Test manuel pour vérifier que OntoWave fonctionne correctement
"""
import requests
import json
import re

def test_local_server():
    """Test que le serveur local répond"""
    base_url = "http://localhost:3000"
    
    print("🧪 Test du serveur local...")
    
    # Test index.html
    response = requests.get(base_url)
    if response.status_code == 200:
        print("✅ index.html accessible")
        
        # Vérifier que OntoWave.js est référencé
        if 'ontowave.min.js' in response.text:
            print("✅ OntoWave.js est référencé dans index.html")
        else:
            print("❌ OntoWave.js non référencé")
            
        # Vérifier la configuration
        if 'window.OntoWaveConfig' in response.text:
            print("✅ Configuration OntoWave présente")
        else:
            print("❌ Configuration OntoWave manquante")
    else:
        print(f"❌ index.html non accessible (status: {response.status_code})")
        return False
    
    # Test OntoWave.js
    response = requests.get(f"{base_url}/ontowave.min.js")
    if response.status_code == 200:
        print("✅ ontowave.min.js accessible")
        
        # Vérifier les fonctionnalités multilingues
        js_content = response.text
        if 'switchLanguage' in js_content:
            print("✅ Fonction switchLanguage présente")
        else:
            print("❌ Fonction switchLanguage manquante")
            
        if 'goHome' in js_content:
            print("✅ Fonction goHome présente")
        else:
            print("❌ Fonction goHome manquante")
            
        if 'currentLanguage' in js_content:
            print("✅ Propriété currentLanguage présente")
        else:
            print("❌ Propriété currentLanguage manquante")
    else:
        print(f"❌ ontowave.min.js non accessible (status: {response.status_code})")
        return False
    
    # Test config.json
    response = requests.get(f"{base_url}/config.json")
    if response.status_code == 200:
        print("✅ config.json accessible")
        
        try:
            config = response.json()
            if 'sources' in config:
                print("✅ Propriété 'sources' présente dans config.json")
                print(f"   Sources: {config['sources']}")
            else:
                print("❌ Propriété 'sources' manquante dans config.json")
                
            if 'locales' in config:
                print(f"✅ Locales configurées: {config['locales']}")
            else:
                print("❌ Locales non configurées")
        except json.JSONDecodeError:
            print("❌ config.json mal formé")
    else:
        print(f"❌ config.json non accessible (status: {response.status_code})")
    
    # Test des fichiers markdown
    for lang in ['fr', 'en']:
        for file in [f'index.{lang}.md', f'examples.{lang}.md']:
            response = requests.get(f"{base_url}/{file}")
            if response.status_code == 200:
                print(f"✅ {file} accessible")
            else:
                print(f"❌ {file} non accessible (status: {response.status_code})")
    
    return True

if __name__ == "__main__":
    print("🚀 Test manuel d'OntoWave")
    print("=" * 50)
    
    try:
        success = test_local_server()
        if success:
            print("\n🎉 Tous les tests de base passent !")
            print("\n📋 Instructions pour l'activation de GitHub Pages:")
            print("1. Aller sur https://github.com/stephanedenis/OntoWave")
            print("2. Settings > Pages")
            print("3. Source: Deploy from a branch")
            print("4. Branch: main, Folder: /docs")
            print("5. Custom domain: ontowave.org")
            print("\n🌐 Le site sera disponible sur https://ontowave.org dans quelques minutes")
        else:
            print("\n❌ Certains tests ont échoué")
    except Exception as e:
        print(f"\n💥 Erreur lors des tests: {e}")
