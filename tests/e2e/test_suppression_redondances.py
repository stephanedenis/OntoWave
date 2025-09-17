import os
from playwright.sync_api import expect
import pytest


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8000").rstrip("/")

def _u(path: str) -> str:
    p = path.lstrip("#/")
    if p.startswith("http"):
        return p
    return f"{BASE_URL}/{p}"


class TestSuppressionRedondances:
    """Tests pour valider la suppression des redondances entre site principal et démos"""
    
    def test_contenu_specialise(self, page):
        """Vérifier que chaque page a son contenu spécialisé sans redondance"""
        print('🧹 Test suppression des redondances entre site principal et démos...')
        
        # Test 1: Vérifier que la page principale a son contenu spécifique
        page.goto(_u('/'))
        page.wait_for_timeout(3000)
        
        main_content = page.text_content('body')
        assert 'OntoWave.org' in main_content
        assert 'JavaScript puissante' in main_content or 'bibliothèque' in main_content
        print('✅ Page principale chargée')
        print('✅ Contenu principal présent')
        
        # Test 2: Vérifier que la démo minimale a son contenu spécialisé
        page.goto(_u('/demo/minimal-demo.html'))
        
        # Attendre que OntoWave charge le contenu spécifique
        try:
            page.wait_for_selector('body:has-text("Démo Minimale")', timeout=10000)
        except:
            # Si le titre n'apparaît pas, attendre que OntoWave soit au moins initialisé
            page.wait_for_selector('body:has-text("OntoWave")', timeout=10000)
        
        page.wait_for_timeout(3000)  # Attendre le chargement complet
        
        minimal_content = page.text_content('body')
        
        # Debug: afficher le contenu récupéré
        print('=== CONTENU DÉMO MINIMALE ===')
        print(minimal_content[:500] + '...' if len(minimal_content) > 500 else minimal_content)
        print('=== FIN CONTENU ===')
        
        # La démo minimale doit avoir son contenu spécialisé
        assert 'Démo Minimale' in minimal_content
        assert 'Configuration utilisée' in minimal_content
        assert 'Prochaine étape' in minimal_content
        print('✅ Contenu spécialisé démo minimale validé')
        
        # Test 3: Vérifier que la démo avancée a son contenu spécialisé
        page.goto(_u('/demo/advanced-demo.html'))
        
        # Attendre que OntoWave charge le contenu
        page.wait_for_selector('body:has-text("OntoWave")', timeout=10000)
        page.wait_for_timeout(2000)  # Attendre le chargement complet
        
        advanced_content = page.text_content('body')
        
        # La démo avancée doit avoir son contenu spécialisé
        assert 'Démo Avancée' in advanced_content
        assert 'interface MkDocs' in advanced_content
        assert 'fonctionnalités avancées' in advanced_content
        print('✅ Contenu spécialisé démo avancée validé')
        
        # Test 4: Vérifier qu'il n'y a pas de redondance
        # Le contenu principal ne doit pas apparaître dans les démos
        main_unique_phrases = [
            'JavaScript puissante',
            'Basé sur Markdown',
            'Multilingue'
        ]
        
        for phrase in main_unique_phrases:
            assert phrase not in minimal_content, f"Redondance détectée: '{phrase}' ne doit pas être dans la démo minimale"
            assert phrase not in advanced_content, f"Redondance détectée: '{phrase}' ne doit pas être dans la démo avancée"
        
        print('✅ Aucune redondance détectée entre site principal et démos')
        
        # Test 5: Vérifier que chaque démo a des configurations distinctes
        assert 'languageButtons: \'none\'' in minimal_content or 'No language buttons' in minimal_content
        assert 'English only' in minimal_content or 'anglais' in minimal_content.lower()
        
        print('✅ Configurations distinctes validées')
        print('🎉 Suppression des redondances confirmée!')
