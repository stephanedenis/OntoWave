import os
from playwright.sync_api import expect
import pytest


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8080").rstrip("/")

def _u(path: str) -> str:
    p = path.lstrip("#/")
    if p.startswith("http"):
        return p
    return f"{BASE_URL}/{p}"


class TestDemosSimplification:
    """Tests pour valider que les démonstrations n'ont plus de doublons"""
    
    def test_doublons_supprimes(self):
        """Vérifier que les fichiers en double ont été supprimés"""
        print('🧹 Test suppression des démonstrations en double...')
        
        # Vérifier que les anciens doublons n'existent plus
        old_duplicates = [
            "/home/stephane/GitHub/OntoWave/docs/demo/minimal.html",
            "/home/stephane/GitHub/OntoWave/docs/demo/basic/",
            "/home/stephane/GitHub/OntoWave/docs/demo/testing/",
            "/home/stephane/GitHub/OntoWave/docs/demo/advanced/"
        ]
        
        for duplicate_path in old_duplicates:
            assert not os.path.exists(duplicate_path), f"Le doublon {duplicate_path} doit être supprimé"
        
        print('✅ Doublons supprimés avec succès')
    
    def test_demos_essentielles_presentes(self):
        """Vérifier que les démonstrations essentielles sont toujours présentes"""
        print('🔍 Vérification des démonstrations essentielles...')
        
        essential_demos = [
            "/home/stephane/GitHub/OntoWave/docs/demo/minimal-demo.html",
            "/home/stephane/GitHub/OntoWave/docs/demo/advanced-demo.html", 
            "/home/stephane/GitHub/OntoWave/docs/demo/full-config.html",
            "/home/stephane/GitHub/OntoWave/docs/demo/minimal-content.md",
            "/home/stephane/GitHub/OntoWave/docs/demo/advanced-content.md"
        ]
        
        for demo_path in essential_demos:
            assert os.path.exists(demo_path), f"La démo essentielle {demo_path} doit exister"
        
        print('✅ Toutes les démonstrations essentielles sont présentes')
    
    def test_acces_demos_fonctionnel(self, page):
        """Vérifier que les démonstrations restantes sont accessibles"""
        print('🌐 Test accès aux démonstrations restantes...')
        
        demos_to_test = [
            '/demo/minimal-demo.html',
            '/demo/advanced-demo.html', 
            '/demo/full-config.html'
        ]
        
        for demo_url in demos_to_test:
            page.goto(_u(demo_url))
            page.wait_for_timeout(2000)
            
            # Vérifier que la page se charge
            title = page.title()
            assert 'OntoWave' in title, f"Le titre de {demo_url} doit contenir 'OntoWave'"
            
            # Vérifier que OntoWave se charge
            content = page.text_content('body')
            assert len(content) > 100, f"La démo {demo_url} doit avoir du contenu"
            
            print(f'✅ {demo_url} fonctionne correctement')
        
        print('🎉 Toutes les démonstrations fonctionnent !')

    def test_structure_finale_propre(self):
        """Vérifier que la structure finale du dossier demo est propre"""
        print('📁 Vérification de la structure propre...')
        
        demo_dir = "/home/stephane/GitHub/OntoWave/docs/demo"
        
        # Lister tous les fichiers
        all_files = []
        for root, dirs, files in os.walk(demo_dir):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), demo_dir)
                all_files.append(rel_path)
        
        print(f"Fichiers dans demo/: {sorted(all_files)}")
        
        # Vérifier qu'il n'y a pas de doublons évidents
        html_files = [f for f in all_files if f.endswith('.html')]
        print(f"Fichiers HTML: {html_files}")
        
        # Ne doit pas avoir plus de 3 fichiers HTML principaux
        assert len(html_files) <= 3, f"Trop de fichiers HTML ({len(html_files)}), possible doublons restants"
        
        # Vérifier qu'il n'y a pas de sous-dossiers de test
        subdirs = [d for d in os.listdir(demo_dir) if os.path.isdir(os.path.join(demo_dir, d))]
        assert len(subdirs) == 0, f"Il ne doit plus y avoir de sous-dossiers : {subdirs}"
        
        print('✅ Structure du dossier demo est propre')
        print('🎉 Nettoyage des démonstrations terminé avec succès !')
