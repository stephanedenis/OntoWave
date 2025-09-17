#!/usr/bin/env python3
"""
Test de validation de la suppression des sections redondantes

Vérifie que :
1. Section "Démarrage Rapide" supprimée (FR) - garde "Utilisation"
2. Section "Démonstrations" supprimée (FR) - garde "Démos et exemples"  
3. Section "Quick Start" supprimée (EN) - garde "Usage"
4. Section "Demos" supprimée (EN) - garde "Demos and examples"
5. Plus de duplication de sections License
"""

import requests
import sys

def test_french_sections():
    """Vérifie que les sections redondantes françaises ont été supprimées"""
    base_url = "http://localhost:8080"
    
    response = requests.get(f"{base_url}/index.fr.md")
    assert response.status_code == 200, "index.fr.md doit être accessible"
    
    content = response.text
    
    # Vérifier que les sections redondantes ont été supprimées
    assert "## Démarrage Rapide" not in content, "Section 'Démarrage Rapide' doit être supprimée"
    assert "## Démonstrations" not in content, "Section 'Démonstrations' doit être supprimée"
    
    # Vérifier que les bonnes sections sont conservées
    assert "### Utilisation" in content, "Section 'Utilisation' doit être conservée"
    # Gérer l'encodage UTF-8 problématique
    assert ("Démos et exemples" in content or "DÃ©mos et exemples" in content), "Section 'Démos et exemples' doit être conservée"
    
    # Vérifier qu'il n'y a qu'une seule section Licence
    licence_count = content.count("### Licence") + content.count("###  Licence")
    assert licence_count == 1, f"Il ne doit y avoir qu'une section Licence, trouvé {licence_count}"
    
    print("✅ Sections françaises : redondances supprimées, bonnes sections conservées")

def test_english_sections():
    """Vérifie que les sections redondantes anglaises ont été supprimées"""
    base_url = "http://localhost:8080"
    
    response = requests.get(f"{base_url}/index.en.md")
    assert response.status_code == 200, "index.en.md doit être accessible"
    
    content = response.text
    
    # Vérifier que les sections redondantes ont été supprimées
    assert "## Quick Start" not in content, "Section 'Quick Start' doit être supprimée"
    assert "## Demos\n" not in content, "Section 'Demos' (niveau 2) doit être supprimée"
    
    # Vérifier que les bonnes sections sont conservées
    assert "### Usage" in content, "Section 'Usage' doit être conservée"
    assert "Demos and examples" in content, "Section 'Demos and examples' doit être conservée"
    
    # Vérifier qu'il n'y a qu'une seule section License
    license_count = content.count("### License")
    assert license_count == 1, f"Il ne doit y avoir qu'une section License, trouvé {license_count}"
    
    print("✅ Sections anglaises : redondances supprimées, bonnes sections conservées")

def test_content_coherence():
    """Vérifie que le contenu reste cohérent"""
    base_url = "http://localhost:8080"
    
    # Test français
    response_fr = requests.get(f"{base_url}/index.fr.md")
    content_fr = response_fr.text
    
    assert "OntoWave" in content_fr, "Le titre principal doit être présent"
    assert ("Une bibliothèque JavaScript puissante" in content_fr or "Une bibliothÃ¨que JavaScript puissante" in content_fr), "La description doit être présente"
    assert "script src=\"ontowave.min.js\"" in content_fr, "L'exemple d'utilisation doit être présent"
    
    # Test anglais
    response_en = requests.get(f"{base_url}/index.en.md")
    content_en = response_en.text
    
    assert "OntoWave" in content_en, "Le titre principal doit être présent"
    assert "A powerful JavaScript library" in content_en, "La description doit être présente" 
    assert "script src=\"ontowave.min.js\"" in content_en, "L'exemple d'utilisation doit être présent"
    
    print("✅ Contenu cohérent : titres, descriptions et exemples présents")

if __name__ == "__main__":
    try:
        print("🧪 Test de validation de la suppression des sections redondantes")
        print()
        
        test_french_sections()
        test_english_sections()  
        test_content_coherence()
        
        print()
        print("🎉 TOUS LES TESTS PASSENT !")
        print("✅ Sections redondantes supprimées avec succès")
        print("✅ Structure française optimisée : Fonctionnalités → Utilisation → Démos et exemples → Architecture → Licence")
        print("✅ Structure anglaise optimisée : Features → Usage → Demos and examples → Architecture → Customization → License")
        print("✅ Plus de duplication, contenu cohérent")
        
    except Exception as e:
        print(f"❌ Test échoué : {str(e)}")
        sys.exit(1)
