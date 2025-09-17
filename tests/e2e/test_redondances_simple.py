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
    
    def test_pas_de_fichier_index_racine(self):
        """Vérifier que le fichier index.html redondant à la racine a été supprimé"""
        print('🧹 Test suppression du fichier index.html redondant à la racine...')
        
        # Vérifier qu'il n'y a plus de index.html à la racine du projet
        root_index_path = "/home/stephane/GitHub/OntoWave/index.html"
        assert not os.path.exists(root_index_path), f"Le fichier {root_index_path} doit être supprimé pour éviter la redondance"
        
        print('✅ Fichier index.html redondant supprimé de la racine')
    
    def test_separation_contenu_demos(self, page):
        """Vérifier que les démos ont un contenu distinct du site principal"""
        print('🧹 Test séparation du contenu entre site principal et démos...')
        
        # Test 1: Charger la page principale
        page.goto(_u('/'))
        page.wait_for_timeout(4000)
        main_content = page.text_content('body')
        
        # Vérifier que la page principale a son contenu attendu
        assert 'OntoWave.org' in main_content
        print('✅ Page principale chargée')
        
        # Test 2: Charger la démo minimale 
        page.goto(_u('/demo/minimal-demo.html'))
        page.wait_for_timeout(4000)
        minimal_content = page.text_content('body')
        
        # Vérifier que la démo a une configuration différente
        assert 'Minimal configuration' in minimal_content or 'English only' in minimal_content
        assert 'languageButtons: \'none\'' in minimal_content or 'No language buttons' in minimal_content
        print('✅ Démo minimale a sa propre configuration')
        
        # Test 3: Charger la démo avancée
        page.goto(_u('/demo/advanced-demo.html'))  
        page.wait_for_timeout(4000)
        advanced_content = page.text_content('body')
        
        # Vérifier que la démo avancée a sa configuration
        assert 'OntoWave v2.0' in advanced_content or 'Getting' in advanced_content
        print('✅ Démo avancée a sa propre configuration')
        
        # Test 4: Vérifier qu'il n'y a pas de redondance de contenu principal
        # Les phrases spécifiques au site principal ne doivent pas être dans les démos
        main_specific_content = [
            'JavaScript puissante',
            'Basé sur Markdown', 
            'Multilingue'
        ]
        
        for content in main_specific_content:
            # Ces contenus peuvent être dans main_content mais pas dans les démos
            if content in main_content:
                assert content not in minimal_content, f"Redondance détectée: '{content}' du site principal ne doit pas être dans la démo minimale"
                assert content not in advanced_content, f"Redondance détectée: '{content}' du site principal ne doit pas être dans la démo avancée"
        
        print('✅ Aucune redondance de contenu principal détectée dans les démos')
        
        # Test 5: Vérifier que les démos n'ont pas le même contenu entre elles
        # Chaque démo doit avoir ses propres spécificités
        assert minimal_content != advanced_content, "Les démos minimale et avancée ne doivent pas avoir le même contenu"
        print('✅ Les démos ont des contenus distincts entre elles')
        
        print('🎉 Test de suppression des redondances validé!')
        
    def test_structure_fichiers_propre(self):
        """Vérifier que la structure des fichiers est propre et sans redondance"""
        print('🧹 Test structure des fichiers...')
        
        # Vérifier que les fichiers de démo existent
        demo_files = [
            "/home/stephane/GitHub/OntoWave/docs/demo/minimal-demo.html",
            "/home/stephane/GitHub/OntoWave/docs/demo/advanced-demo.html",
            "/home/stephane/GitHub/OntoWave/docs/demo/minimal-content.md",
            "/home/stephane/GitHub/OntoWave/docs/demo/advanced-content.md"
        ]
        
        for file_path in demo_files:
            assert os.path.exists(file_path), f"Le fichier {file_path} doit exister"
        
        # Vérifier que le index principal existe
        main_index = "/home/stephane/GitHub/OntoWave/docs/index.html"
        assert os.path.exists(main_index), f"Le fichier {main_index} doit exister"
        
        print('✅ Structure des fichiers validée')
        print('🎉 Tous les tests de structure passent!')
