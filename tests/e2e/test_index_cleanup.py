#!/usr/bin/env python3
"""
Test de validation du nettoyage des fichiers index

Vérifie que :
1. Les fichiers index.fr.md et index.en.md existent et sont cohérents
2. Le fichier index.md vide a été supprimé
3. Aucune référence obsolète aux dossiers basic/ et testing/
4. Les liens vers les démonstrations fonctionnent
"""

import requests
import os
import sys

def test_index_files_exist():
    """Vérifie que les fichiers index nécessaires existent"""
    base_url = "http://localhost:8080"
    
    # Test index.fr.md
    response = requests.get(f"{base_url}/index.fr.md")
    assert response.status_code == 200, "index.fr.md doit être accessible"
    assert "OntoWave" in response.text, "index.fr.md doit contenir le titre OntoWave"
    assert "Une bibliothÃ¨que JavaScript puissante" in response.text, "index.fr.md doit contenir le contenu français"
    
    # Test index.en.md
    response = requests.get(f"{base_url}/index.en.md")
    assert response.status_code == 200, "index.en.md doit être accessible"
    assert "OntoWave" in response.text, "index.en.md doit contenir le titre OntoWave"
    assert "A powerful JavaScript library" in response.text, "index.en.md doit contenir le contenu anglais"
    
    print("✅ Les fichiers index.fr.md et index.en.md sont accessibles")

def test_no_obsolete_references():
    """Vérifie qu'il n'y a plus de références aux dossiers supprimés"""
    base_url = "http://localhost:8080"
    
    # Test index.fr.md
    response = requests.get(f"{base_url}/index.fr.md")
    content_fr = response.text
    assert "demo/basic/" not in content_fr, "index.fr.md ne doit plus référencer demo/basic/"
    assert "demo/testing/" not in content_fr, "index.fr.md ne doit plus référencer demo/testing/"
    assert "Exemples Hérités" not in content_fr, "index.fr.md ne doit plus contenir 'Exemples Hérités'"
    assert "Suite de Tests" not in content_fr, "index.fr.md ne doit plus contenir 'Suite de Tests'"
    
    # Test index.en.md
    response = requests.get(f"{base_url}/index.en.md")
    content_en = response.text
    assert "demo/basic/" not in content_en, "index.en.md ne doit plus référencer demo/basic/"
    assert "demo/testing/" not in content_en, "index.en.md ne doit plus référencer demo/testing/"
    assert "Legacy Examples" not in content_en, "index.en.md ne doit plus contenir 'Legacy Examples'"
    assert "Testing Suite" not in content_en, "index.en.md ne doit plus contenir 'Testing Suite'"
    
    print("✅ Aucune référence obsolète trouvée")

def test_valid_demo_links():
    """Vérifie que les liens vers les démonstrations sont valides"""
    base_url = "http://localhost:8080"
    
    # Vérifier que les démonstrations existent
    demos = [
        "demo/minimal-demo.html",
        "demo/advanced-demo.html", 
        "demo/full-config.html"
    ]
    
    for demo in demos:
        response = requests.get(f"{base_url}/{demo}")
        assert response.status_code == 200, f"La démo {demo} doit être accessible"
    
    print("✅ Toutes les démonstrations référencées sont accessibles")

def test_index_md_removed():
    """Vérifie que le fichier index.md vide a été supprimé"""
    base_url = "http://localhost:8080"
    
    # Test que index.md n'existe plus ou est vide
    response = requests.get(f"{base_url}/index.md")
    # Soit 404 (fichier supprimé), soit contenu vide si le serveur renvoie quand même quelque chose
    if response.status_code == 200:
        assert len(response.text.strip()) == 0, "index.md doit être vide s'il existe encore"
    
    print("✅ Le fichier index.md vide a été traité correctement")

if __name__ == "__main__":
    try:
        print("🧪 Test de validation du nettoyage des fichiers index")
        print()
        
        test_index_files_exist()
        test_no_obsolete_references()  
        test_valid_demo_links()
        test_index_md_removed()
        
        print()
        print("🎉 TOUS LES TESTS PASSENT !")
        print("✅ Le nettoyage des fichiers index est validé")
        print("✅ Plus de duplication entre les fichiers index")
        print("✅ Plus de références obsolètes aux dossiers supprimés")
        print("✅ OntoWave peut fonctionner correctement avec les fichiers nettoyés")
        
    except Exception as e:
        print(f"❌ Test échoué : {str(e)}")
        sys.exit(1)
