/**
 * Styles CSS et JavaScript pour l'interface multilingue
 * À intégrer dans le build de ontowave.min.js
 */

// CSS pour l'interface multilingue
const MULTILANG_CSS = `
.lang-toggle {
    position: fixed;
    top: 120px;
    left: 20px;
    z-index: 999;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 8px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    border: 1px solid #e1e4e8;
}

.lang-toggle button {
    padding: 6px 10px;
    border: 1px solid #d0d7de;
    border-radius: 16px;
    background: white;
    cursor: pointer;
    font-size: 0.75em;
    min-width: 80px;
    text-align: center;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.lang-toggle button:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
}

.lang-toggle button.active {
    background: #0969da;
    color: white;
    border-color: #0969da;
}

.lang-content {
    transition: opacity 0.3s ease;
}

.lang-content.hidden {
    display: none !important;
}

.lang-content.visible {
    display: block !important;
}
`;

// JavaScript pour l'interface multilingue
const MULTILANG_JS = `
// Système multilingue OntoWave
(function() {
    function initializeMultilang() {
        console.log('🌐 Initialisation du système multilingue');
        
        // Injecter le CSS si pas déjà présent
        if (!document.getElementById('ontowave-multilang-css')) {
            const style = document.createElement('style');
            style.id = 'ontowave-multilang-css';
            style.textContent = \`${MULTILANG_CSS}\`;
            document.head.appendChild(style);
        }
        
        // Vérifier que les éléments sont présents
        const frDiv = document.getElementById('lang-fr');
        const enDiv = document.getElementById('lang-en');
        
        if (!frDiv || !enDiv) {
            console.log('❌ Éléments de langue non trouvés, retry dans 1s');
            setTimeout(initializeMultilang, 1000);
            return;
        }
        
        console.log('✅ Éléments de langue trouvés');
        
        // Masquer tous les contenus par défaut
        document.querySelectorAll('.lang-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('visible');
        });
        
        // Créer les boutons de navigation s'ils n'existent pas
        let langToggle = document.querySelector('.lang-toggle');
        if (!langToggle) {
            langToggle = document.createElement('div');
            langToggle.className = 'lang-toggle';
            langToggle.innerHTML = \`
                <button onclick="window.OntoWave.toggleLang('fr')" id="btn-fr">🇫🇷 FR</button>
                <button onclick="window.OntoWave.toggleLang('en')" id="btn-en">🇬🇧 EN</button>
            \`;
            document.body.appendChild(langToggle);
            console.log('✅ Boutons de langue créés');
        }
        
        // Initialiser la langue (français par défaut)
        const savedLang = localStorage.getItem('ontowave-lang') || 'fr';
        
        // Configurer OntoWave pour la langue
        if (window.OntoWave && window.OntoWave.config) {
            console.log('⚙️ Configuration OntoWave pour langue:', savedLang);
            window.OntoWave.config.i18n = { 
                default: savedLang, 
                lang: savedLang,
                supported: ['fr', 'en']
            };
            window.OntoWave.config.ui = window.OntoWave.config.ui || {};
            window.OntoWave.config.ui.lang = savedLang;
        }
        
        window.OntoWave.toggleLang(savedLang);
        
        // Forcer Prism à recolorer après le chargement du contenu
        if (window.Prism && window.Prism.highlightAll) {
            console.log('🎨 Recoloration Prism forcée');
            window.Prism.highlightAll();
        }
        
        // Recolorer encore après un délai au cas où le contenu se charge tardivement
        setTimeout(() => {
            if (window.Prism && window.Prism.highlightAll) {
                console.log('🎨 Recoloration Prism différée');
                window.Prism.highlightAll();
            }
        }, 1000);
    }
    
    // Mise à jour des textes OntoWave selon la langue
    function updateOntoWaveTexts(lang) {
        console.log('🌐 Mise à jour textes OntoWave:', lang);
        
        const texts = {
            fr: {
                'accueil': '🏠 Accueil',
                'configuration': '⚙️ Configuration',
                'menu': 'Menu',
                'theme': 'Thème', 
                'search': 'Rechercher',
                'close': 'Fermer',
                'copy': 'Copier',
                'fullscreen': 'Plein écran',
                'download': 'Télécharger',
                'print': 'Imprimer'
            },
            en: {
                'accueil': '🏠 Home',
                'configuration': '⚙️ Settings',
                'menu': 'Menu',
                'theme': 'Theme',
                'search': 'Search', 
                'close': 'Close',
                'copy': 'Copy',
                'fullscreen': 'Fullscreen',
                'download': 'Download',
                'print': 'Print'
            }
        };
        
        const currentTexts = texts[lang] || texts.fr;
        
        // Mettre à jour les éléments de l'interface OntoWave
        setTimeout(() => {
            console.log('🔍 Recherche des éléments OntoWave à traduire...');
            
            // Cibler spécifiquement les options de menu OntoWave
            const menuOptions = document.querySelectorAll('.ontowave-menu-option');
            console.log(\`📋 Trouvé \${menuOptions.length} options de menu\`);
            
            menuOptions.forEach((option, index) => {
                const currentText = option.textContent.trim();
                console.log(\`🔤 Option \${index}: "\${currentText}"\`);
                
                // Mapper les textes selon le contenu actuel
                if (currentText.includes('Accueil') || currentText.includes('Home')) {
                    option.textContent = currentTexts.accueil;
                    console.log(\`✅ Accueil -> "\${currentTexts.accueil}"\`);
                } else if (currentText.includes('Configuration') || currentText.includes('Settings')) {
                    option.textContent = currentTexts.configuration;
                    console.log(\`✅ Configuration -> "\${currentTexts.configuration}"\`);
                }
            });
            
            // Également chercher les attributs title/aria-label
            const elements = document.querySelectorAll('[title], [aria-label]');
            elements.forEach(el => {
                const title = el.getAttribute('title');
                const ariaLabel = el.getAttribute('aria-label');
                
                if (title && currentTexts[title.toLowerCase()]) {
                    el.setAttribute('title', currentTexts[title.toLowerCase()]);
                }
                if (ariaLabel && currentTexts[ariaLabel.toLowerCase()]) {
                    el.setAttribute('aria-label', currentTexts[ariaLabel.toLowerCase()]);
                }
            });
            
            console.log('✅ Textes OntoWave mis à jour pour', lang);
        }, 300);
    }

    // Fonction pour changer de langue
    function toggleLang(lang) {
        console.log('🔄 Bascule vers:', lang);
        
        // Masquer tous les contenus
        document.querySelectorAll('.lang-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('visible');
        });
        
        // Afficher le contenu de la langue sélectionnée
        const targetContent = document.getElementById('lang-' + lang);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('visible');
        }
        
        // Mettre à jour les boutons
        document.querySelectorAll('.lang-toggle button').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById('btn-' + lang);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Sauvegarder la préférence
        localStorage.setItem('ontowave-lang', lang);
        
        // Mettre à jour les textes de l'interface OntoWave
        updateOntoWaveTexts(lang);
        
        // Forcer plusieurs recolorations Prism
        console.log('🎨 Recoloration Prism immédiate');
        if (window.Prism && window.Prism.highlightAll) {
            window.Prism.highlightAll();
        }
        
        // Recoloration différée pour s'assurer que ça marche
        setTimeout(() => {
            if (window.Prism && window.Prism.highlightAll) {
                console.log('🎨 Recoloration Prism différée 1');
                window.Prism.highlightAll();
            }
        }, 100);
        
        setTimeout(() => {
            if (window.Prism && window.Prism.highlightAll) {
                console.log('🎨 Recoloration Prism différée 2');
                window.Prism.highlightAll();
            }
        }, 500);
        
        setTimeout(() => {
            if (window.Prism && window.Prism.highlightAll) {
                console.log('🎨 Recoloration Prism différée 3');
                window.Prism.highlightAll();
            }
        }, 1000);
    }
    
    // Attendre que OntoWave ait fini de charger le contenu
    document.addEventListener('DOMContentLoaded', function() {
        // Attendre un peu plus pour que OntoWave termine
        setTimeout(initializeMultilang, 2000);
    });
    
    // Exposer les fonctions globalement
    window.OntoWave = window.OntoWave || {};
    window.OntoWave.toggleLang = toggleLang;
    window.OntoWave.updateOntoWaveTexts = updateOntoWaveTexts;
    window.OntoWave.initializeMultilang = initializeMultilang;
})();
`;

export { MULTILANG_CSS, MULTILANG_JS };
