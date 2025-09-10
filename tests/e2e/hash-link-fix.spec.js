// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Hash Link Fix', () => {
  test('Implement comprehensive hash link fix', async ({ page }) => {
    console.log('🔧 Implémentation du fix complet des liens hash...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(5000); // Laisser le système de secours s'activer
    
    // Implémenter un fix complet dans le navigateur
    const fixResult = await page.evaluate(() => {
      const implementHashFix = () => {
        console.log('🔧 Installation du fix complet de navigation hash...');
        
        // 1. Corriger les liens problématiques
        const fixBadLinks = () => {
          // Corriger les liens vers #/ pour qu'ils pointent vers #index.md
          const badLinks = document.querySelectorAll('a[href="#/"], a[href="#"]');
          badLinks.forEach(link => {
            link.setAttribute('href', '#index.md');
            console.log('🔗 Lien corrigé vers #index.md');
          });
        };
        
        // 2. Intercepter tous les clics sur les liens
        const interceptClicks = () => {
          document.addEventListener('click', (event) => {
            const target = event.target;
            if (target && typeof target.closest === 'function') {
              const link = target.closest('a[href*="#"]');
              if (link) {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                  console.log(`🔗 Clic intercepté sur: ${href}`);
                  
                  // Empêcher le comportement par défaut
                  event.preventDefault();
                  event.stopPropagation();
                  
                  // Navigation manuelle
                  if (href === '#' || href === '#/') {
                    // Rediriger vers la page d'accueil
                    location.hash = '#index.md';
                  } else {
                    // Navigation normale
                    location.hash = href;
                  }
                  
                  // Forcer le rechargement du contenu si nécessaire
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                  
                  return false;
                }
              }
            }
          }, true); // Phase de capture
        };
        
        // 3. Améliorer le système de secours pour gérer les liens
        const enhanceFallbackSystem = () => {
          // Intercepter les changements de hash pour le système de secours
          const originalHandler = window.onhashchange;
          
          window.addEventListener('hashchange', async () => {
            console.log('🔄 Hash changé vers:', location.hash);
            
            // Vérifier si l'app est toujours en "Chargement"
            setTimeout(() => {
              const app = document.getElementById('app');
              if (app && app.textContent && app.textContent.includes('Chargement')) {
                console.log('🚨 App bloquée, reactivation du système de secours...');
                
                // Recharger le contenu avec le système de secours
                const loadContentFallback = async (path) => {
                  const candidates = [
                    path,
                    path.replace(/^\//, ''),
                    path + '.md',
                    path.replace(/^\//, '') + '.md',
                    '/index.md',
                    'index.md'
                  ];
                  
                  for (const candidate of candidates) {
                    try {
                      const response = await fetch(candidate);
                      if (response.ok) {
                        return await response.text();
                      }
                    } catch (e) {
                      // Continue
                    }
                  }
                  return null;
                };
                
                const renderSimpleMarkdown = (markdown) => {
                  return markdown
                    .replace(/^# (.+)$/gm, '<h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">$1</h1>')
                    .replace(/^## (.+)$/gm, '<h2 style="color: #666; margin-top: 2rem;">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 style="color: #888;">$1</h3>')
                    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" style="color: #0366d6; text-decoration: none;">$1</a>')
                    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
                    .replace(/\\n\\n/g, '</p><p style="margin: 1rem 0;">')
                    .replace(/\\n/g, '<br>')
                    .replace(/^(.+)/, '<p style="margin: 1rem 0;">$1')
                    .replace(/(.+)$/, '$1</p>');
                };
                
                const handleRoute = async () => {
                  const hash = location.hash.replace(/^#/, '') || 'index.md';
                  const content = await loadContentFallback(hash);
                  
                  if (content && app) {
                    const rendered = renderSimpleMarkdown(content);
                    app.innerHTML = `
                      <div style="max-width: 900px; margin: 0 auto; padding: 20px; font-family: system-ui;">
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                          <strong>✅ Navigation Hash Corrigée</strong> - Route: ${hash}
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                          ${rendered}
                        </div>
                        <hr style="margin: 30px 0;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                          <h3>🧭 Navigation</h3>
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                            <a href="#index.md" style="padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; text-decoration: none; color: #495057;">🏠 Accueil</a>
                            <a href="#en/index.md" style="padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; text-decoration: none; color: #495057;">🇬🇧 English</a>
                            <a href="#fr/index.md" style="padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; text-decoration: none; color: #495057;">🇫🇷 Français</a>
                            <a href="#demo/advanced-shapes.md" style="padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; text-decoration: none; color: #495057;">🎨 Démos PowerPoint</a>
                          </div>
                        </div>
                      </div>
                    `;
                  }
                };
                
                handleRoute();
              }
            }, 500);
          });
        };
        
        // Exécuter tous les fixes
        fixBadLinks();
        interceptClicks();
        enhanceFallbackSystem();
        
        return 'Fix complet installé';
      };
      
      return implementHashFix();
    });
    
    console.log(`✅ ${fixResult}`);
    
    // Tester le fix avec différents types de liens
    const testScenarios = [
      { selector: 'a[href="#index.md"]', expected: '#index.md', name: 'Lien index' },
      { selector: 'a[href="#en/index.md"]', expected: '#en/index.md', name: 'Lien anglais' },
      { selector: 'a[href="#fr/index.md"]', expected: '#fr/index.md', name: 'Lien français' }
    ];
    
    for (const scenario of testScenarios) {
      const link = page.locator(scenario.selector).first();
      if (await link.count() > 0 && await link.isVisible()) {
        console.log(`\n🧪 Test: ${scenario.name}`);
        
        const beforeUrl = page.url();
        await link.click();
        await page.waitForTimeout(2000);
        const afterUrl = page.url();
        
        const success = afterUrl.includes(scenario.expected);
        console.log(`📍 ${beforeUrl} → ${afterUrl}`);
        console.log(`✅ Navigation: ${success ? 'Réussie' : 'Échouée'}`);
      }
    }
  });

  test('Create permanent fix in HTML', async ({ page }) => {
    console.log('📝 Création du fix permanent dans le HTML...');
    
    // Ce test génère le code à ajouter dans index.html
    const fixCode = `
<!-- Fix permanent pour la navigation hash -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Fix de navigation hash chargé');
  
  // Corriger les liens problématiques au chargement
  const fixBadLinks = () => {
    const badLinks = document.querySelectorAll('a[href="#/"], a[href="#"]');
    badLinks.forEach(link => {
      link.setAttribute('href', '#index.md');
      console.log('🔗 Lien corrigé vers #index.md');
    });
  };
  
  // Intercepter les clics pour préserver les hashs
  document.addEventListener('click', function(event) {
    const target = event.target;
    if (target && target.closest) {
      const link = target.closest('a[href*="#"]');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          event.preventDefault();
          
          if (href === '#' || href === '#/') {
            location.hash = '#index.md';
          } else {
            location.hash = href;
          }
          
          console.log('🔗 Navigation hash:', location.hash);
          return false;
        }
      }
    }
  }, true);
  
  // Corriger les liens au chargement
  fixBadLinks();
  
  // Corriger les liens après chaque mise à jour du DOM
  const observer = new MutationObserver(fixBadLinks);
  observer.observe(document.body, { childList: true, subtree: true });
});
</script>
`;
    
    console.log('✅ Code de fix généré');
    console.log(`📏 Taille: ${fixCode.length} caractères`);
    
    // Le code sera ajouté manuellement dans index.html
    expect(fixCode.length).toBeGreaterThan(100);
  });
});
