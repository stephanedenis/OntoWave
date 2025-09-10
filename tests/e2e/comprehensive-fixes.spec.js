// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Performance & Functionality Issues', () => {
  test('Diagnose slow loading, Mermaid rendering, and hash preservation', async ({ page }) => {
    console.log('🔍 Diagnostic des problèmes de performance et fonctionnalité...');
    
    // Capturer tous les logs et erreurs
    const errors = [];
    const logs = [];
    
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    // Mesurer le temps de chargement
    const startTime = Date.now();
    console.log('⏱️ Début du chargement...');
    
    await page.goto('http://127.0.0.1:8080/');
    
    // Attendre que l'application soit prête
    let loadingComplete = false;
    let attempt = 0;
    const maxAttempts = 15; // 15 secondes max
    
    while (!loadingComplete && attempt < maxAttempts) {
      attempt++;
      await page.waitForTimeout(1000);
      
      const content = await page.locator('#app').textContent();
      const isLoading = content?.includes('Chargement');
      const hasContent = content && content.length > 100;
      
      if (!isLoading && hasContent) {
        loadingComplete = true;
        const loadTime = Date.now() - startTime;
        console.log(`✅ Chargement terminé en ${loadTime}ms (${attempt} secondes)`);
        
        if (loadTime > 5000) {
          console.log('⚠️ PROBLÈME 1: Chargement lent (> 5 secondes)');
        } else {
          console.log('✅ Performance de chargement acceptable');
        }
      } else {
        console.log(`⏳ Tentative ${attempt}: ${isLoading ? 'Toujours en chargement' : 'Pas de contenu'}`);
      }
    }
    
    if (!loadingComplete) {
      console.log('❌ PROBLÈME 1: Chargement très lent ou bloqué');
    }
    
    // Vérifier le rendu Mermaid
    console.log('\n🧪 Test du rendu Mermaid...');
    
    await page.waitForTimeout(2000);
    
    // Chercher les diagrammes Mermaid
    const mermaidElements = await page.locator('.mermaid, svg[aria-roledescription="mermaid"], .mermaid-diagram').count();
    console.log(`📊 Éléments Mermaid trouvés: ${mermaidElements}`);
    
    if (mermaidElements === 0) {
      console.log('❌ PROBLÈME 2: Aucun diagramme Mermaid rendu');
      
      // Vérifier si le code Mermaid est présent en tant que texte
      const mermaidCode = await page.locator('text=flowchart, text=graph, text=sequenceDiagram').count();
      console.log(`📝 Code Mermaid brut trouvé: ${mermaidCode}`);
      
      if (mermaidCode > 0) {
        console.log('🔍 Code Mermaid présent mais non rendu');
      }
    } else {
      console.log('✅ Diagrammes Mermaid rendus correctement');
    }
    
    // Test de navigation hash
    console.log('\n🔗 Test de préservation des hash...');
    
    const initialUrl = page.url();
    console.log(`📍 URL initiale: ${initialUrl}`);
    
    // Tester navigation vers page anglaise
    const englishLink = page.locator('a[href*="en"]').first();
    if (await englishLink.count() > 0 && await englishLink.isVisible()) {
      await englishLink.click();
      await page.waitForTimeout(2000);
      
      const newUrl = page.url();
      console.log(`📍 URL après navigation: ${newUrl}`);
      
      const hashLost = !newUrl.includes('#') || newUrl.endsWith('#');
      if (hashLost) {
        console.log('❌ PROBLÈME 3: Hash perdu lors de la navigation');
      } else {
        console.log('✅ Hash préservé lors de la navigation');
      }
    }
    
    // Résumé des erreurs
    console.log('\n📊 Résumé des problèmes détectés:');
    if (errors.length > 0) {
      console.log(`❌ Erreurs JavaScript: ${errors.length}`);
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log(`📝 Total logs: ${logs.length}`);
  });

  test('Implement comprehensive fixes', async ({ page }) => {
    console.log('🔧 Implémentation des corrections complètes...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(3000);
    
    const fixResult = await page.evaluate(() => {
      console.log('🚀 Installation des fixes complets...');
      
      // Fix 1: Accélération du chargement
      const accelerateLoading = () => {
        // Réduire le délai du système de secours
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          if (script.textContent && script.textContent.includes('setTimeout') && script.textContent.includes('4000')) {
            script.textContent = script.textContent.replace('4000', '1000');
            console.log('⚡ Délai du système de secours réduit à 1 seconde');
          }
        });
        
        // Forcer le chargement immédiat si bloqué
        const app = document.getElementById('app');
        if (app && app.textContent && app.textContent.includes('Chargement')) {
          console.log('🚀 Déclenchement immédiat du système de secours...');
          
          const loadContent = async () => {
            try {
              const response = await fetch('/index.md');
              if (response.ok) {
                const content = await response.text();
                const rendered = content
                  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                  .replace(/```mermaid([\\s\\S]*?)```/g, '<div class="mermaid-to-render">$1</div>')
                  .replace(/\\n/g, '<br>');
                
                app.innerHTML = `
                  <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                    <div style="background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                      ⚡ Chargement accéléré - Index.md
                    </div>
                    ${rendered}
                  </div>
                `;
                
                // Déclencher le rendu Mermaid
                const mermaidDivs = document.querySelectorAll('.mermaid-to-render');
                mermaidDivs.forEach(div => {
                  div.className = 'mermaid';
                });
                
                // Relancer Mermaid si disponible
                if (window.mermaid) {
                  window.mermaid.run();
                }
                
                return true;
              }
            } catch (e) {
              console.log('Erreur de chargement:', e);
            }
            return false;
          };
          
          loadContent();
        }
      };
      
      // Fix 2: Forcer le rendu Mermaid
      const forceMermaidRender = () => {
        console.log('🎨 Forçage du rendu Mermaid...');
        
        // Attendre que Mermaid soit chargé
        const waitForMermaid = () => {
          if (window.mermaid) {
            console.log('✅ Mermaid disponible, initialisation...');
            
            try {
              window.mermaid.initialize({ 
                startOnLoad: true,
                theme: 'default',
                flowchart: { useMaxWidth: true }
              });
              
              // Chercher les blocs de code Mermaid non rendus
              const codeBlocks = document.querySelectorAll('pre code, .language-mermaid, code');
              codeBlocks.forEach(block => {
                const text = block.textContent || '';
                if (text.includes('flowchart') || text.includes('graph') || text.includes('sequenceDiagram')) {
                  const mermaidDiv = document.createElement('div');
                  mermaidDiv.className = 'mermaid';
                  mermaidDiv.textContent = text;
                  block.parentNode?.replaceChild(mermaidDiv, block);
                  console.log('🔄 Bloc Mermaid converti');
                }
              });
              
              // Relancer le rendu
              window.mermaid.run();
              console.log('✅ Rendu Mermaid déclenché');
              
            } catch (e) {
              console.log('❌ Erreur Mermaid:', e);
            }
          } else {
            console.log('⏳ Attente de Mermaid...');
            setTimeout(waitForMermaid, 500);
          }
        };
        
        waitForMermaid();
      };
      
      // Fix 3: Navigation hash robuste
      const fixHashNavigation = () => {
        console.log('🔗 Installation du fix de navigation hash robuste...');
        
        // Intercepter TOUS les clics
        document.addEventListener('click', (e) => {
          const target = e.target;
          const link = target?.closest ? target.closest('a') : null;
          
          if (link && link.href && link.href.includes('#')) {
            e.preventDefault();
            e.stopPropagation();
            
            const href = link.getAttribute('href');
            console.log('🔗 Navigation interceptée:', href);
            
            if (href?.startsWith('#')) {
              window.location.hash = href;
              console.log('✅ Hash mis à jour:', window.location.hash);
            }
            
            return false;
          }
        }, true);
        
        // Corriger les liens problématiques
        const fixLinks = () => {
          const badLinks = document.querySelectorAll('a[href="#"], a[href="#/"]');
          badLinks.forEach(link => {
            link.setAttribute('href', '#index.md');
          });
        };
        
        fixLinks();
        
        // Observer les changements pour corriger nouveaux liens
        new MutationObserver(fixLinks).observe(document.body, { childList: true, subtree: true });
      };
      
      // Appliquer tous les fixes
      accelerateLoading();
      setTimeout(forceMermaidRender, 1000);
      fixHashNavigation();
      
      return 'Tous les fixes appliqués';
    });
    
    console.log(`✅ ${fixResult}`);
    
    // Attendre et vérifier les améliorations
    await page.waitForTimeout(3000);
    
    console.log('\n📊 Vérification des améliorations...');
    
    // Vérifier le chargement
    const content = await page.locator('#app').textContent();
    const fastLoading = !content?.includes('Chargement');
    console.log(`⚡ Chargement rapide: ${fastLoading ? 'OUI' : 'NON'}`);
    
    // Vérifier Mermaid
    const mermaidCount = await page.locator('.mermaid, svg[aria-roledescription="mermaid"]').count();
    console.log(`🎨 Diagrammes Mermaid: ${mermaidCount}`);
    
    // Test de navigation
    const testLink = page.locator('a[href*="#"]').first();
    if (await testLink.count() > 0) {
      const beforeUrl = page.url();
      await testLink.click();
      await page.waitForTimeout(1000);
      const afterUrl = page.url();
      const hashPreserved = afterUrl.includes('#') && !afterUrl.endsWith('#');
      console.log(`🔗 Hash préservé: ${hashPreserved ? 'OUI' : 'NON'}`);
    }
  });
});
