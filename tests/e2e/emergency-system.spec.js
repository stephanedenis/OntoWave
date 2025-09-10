// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Emergency Fix', () => {
  test('Force emergency fallback system to activate immediately', async ({ page }) => {
    console.log('🚨 Test du système d\'urgence OntoWave...');
    
    page.on('console', msg => {
      console.log(`📝 ${msg.text()}`);
    });
    
    await page.goto('http://127.0.0.1:8080/#index.md');
    
    // Attendre 2 secondes puis forcer le système d'urgence
    await page.waitForTimeout(2000);
    
    console.log('🔧 Forçage du système d\'urgence...');
    
    const emergencyResult = await page.evaluate(() => {
      console.log('🚨 Activation forcée du système d\'urgence...');
      
      const app = document.getElementById('app');
      if (!app) return 'App non trouvée';
      
      // Forcer l'état "bloqué" pour déclencher le système de secours
      app.innerHTML = '<div>Chargement bloqué - activation système secours...</div>';
      
      const loadContentFallback = async (path) => {
        const candidates = [
          '/index.md',
          'index.md',
          path || '/index.md'
        ];
        
        for (const candidate of candidates) {
          try {
            const response = await fetch(candidate);
            if (response.ok) {
              const content = await response.text();
              console.log(`✅ Contenu chargé: ${candidate} (${content.length} chars)`);
              return content;
            }
          } catch (e) {
            console.log(`❌ Échec: ${candidate}`);
          }
        }
        return null;
      };
      
      const renderMarkdown = (markdown) => {
        return markdown
          .replace(/^# (.+)$/gm, '<h1 style="color: #333; border-bottom: 2px solid #0366d6; padding-bottom: 0.5rem;">$1</h1>')
          .replace(/^## (.+)$/gm, '<h2 style="color: #586069; margin-top: 2rem;">$1</h2>')
          .replace(/^### (.+)$/gm, '<h3 style="color: #6a737d;">$1</h3>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="#$2" style="color: #0366d6; text-decoration: none;">$1</a>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/```mermaid([\\s\\S]*?)```/g, '<div class="mermaid" style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px; margin: 16px 0;">$1</div>')
          .replace(/\n\n/g, '</p><p style="margin: 1rem 0; line-height: 1.6;">')
          .replace(/\n/g, '<br>')
          .replace(/^(.+)/, '<p style="margin: 1rem 0; line-height: 1.6;">$1')
          .replace(/(.+)$/, '$1</p>');
      };
      
      const handleEmergencyLoad = async () => {
        const hash = location.hash.replace(/^#/, '') || 'index.md';
        console.log(`🔍 Chargement d'urgence: ${hash}`);
        
        const content = await loadContentFallback(hash);
        
        if (content) {
          const rendered = renderMarkdown(content);
          app.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="margin: 0; color: white;">🚨 OntoWave - Système d'Urgence Actif</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">Application de secours • Route: <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${hash}</code></p>
              </div>
              
              <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(27,31,35,0.15); border: 1px solid #e1e4e8;">
                ${rendered}
              </div>
              
              <div style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 24px; margin-top: 24px;">
                <h3 style="margin-top: 0; color: #24292e;">🧭 Navigation d'Urgence</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-top: 16px;">
                  <a href="#index.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    🏠 Accueil
                  </a>
                  <a href="#en/index.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    🇬🇧 English
                  </a>
                  <a href="#fr/index.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    🇫🇷 Français
                  </a>
                  <a href="#demo/mermaid.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    🎨 Démo Mermaid
                  </a>
                  <a href="#demo/advanced-shapes.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    🎯 Formes PowerPoint
                  </a>
                  <a href="#demo/plantuml.md" style="padding: 12px 16px; background: white; border: 1px solid #d0d7de; border-radius: 6px; text-decoration: none; color: #24292e; display: flex; align-items: center; transition: all 0.2s; font-weight: 500;">
                    📊 PlantUML
                  </a>
                </div>
              </div>
            </div>
          `;
          
          // Ajouter les styles hover
          const style = document.createElement('style');
          style.textContent = `
            a[href^="#"]:hover {
              background: #f3f4f6 !important;
              border-color: #0366d6 !important;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(27,31,35,0.15) !important;
            }
          `;
          document.head.appendChild(style);
          
          // Initialiser Mermaid pour les nouveaux diagrammes
          if (window.mermaid) {
            setTimeout(() => {
              try {
                window.mermaid.run();
                console.log('🎨 Mermaid initialisé pour le contenu d\'urgence');
              } catch (e) {
                console.log('❌ Erreur Mermaid d\'urgence:', e);
              }
            }, 500);
          }
          
          return `Contenu d'urgence chargé: ${content.length} caractères`;
        } else {
          app.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px; font-family: system-ui;">
              <div style="background: #dc3545; color: white; padding: 16px; border-radius: 8px;">
                <h3 style="margin: 0; color: white;">❌ Erreur Critique</h3>
                <p style="margin: 8px 0 0 0;">Impossible de charger le contenu pour: <code>${hash}</code></p>
              </div>
              <div style="margin-top: 20px;">
                <a href="#index.md" style="color: #0366d6;">← Retour à l'accueil</a>
              </div>
            </div>
          `;
          return 'Échec du chargement d\'urgence';
        }
      };
      
      // Installer le gestionnaire de routes d'urgence
      window.addEventListener('hashchange', handleEmergencyLoad);
      
      // Charger immédiatement
      handleEmergencyLoad();
      
      return 'Système d\'urgence activé';
    });
    
    console.log(`🚨 Résultat: ${emergencyResult}`);
    
    // Attendre que le contenu se charge
    await page.waitForTimeout(3000);
    
    // Vérifier le résultat
    const content = await page.locator('#app').textContent();
    const hasEmergencyContent = content?.includes('Système d\'Urgence Actif');
    const hasActualContent = content && content.length > 500;
    
    console.log(`📊 Système d'urgence activé: ${hasEmergencyContent ? 'OUI' : 'NON'}`);
    console.log(`📊 Contenu chargé: ${hasActualContent ? 'OUI' : 'NON'} (${content?.length || 0} chars)`);
    
    if (hasEmergencyContent && hasActualContent) {
      console.log('✅ SUCCÈS: Système d\'urgence fonctionnel');
      
      // Test Mermaid dans le contenu d'urgence
      const mermaidElements = await page.locator('.mermaid').count();
      console.log(`🎨 Éléments Mermaid d'urgence: ${mermaidElements}`);
      
      // Test navigation d'urgence
      const navLink = page.locator('a[href="#demo/mermaid.md"]').first();
      if (await navLink.count() > 0) {
        const beforeUrl = page.url();
        await navLink.click();
        await page.waitForTimeout(2000);
        const afterUrl = page.url();
        const navWorks = afterUrl !== beforeUrl && afterUrl.includes('#demo/mermaid');
        console.log(`🔗 Navigation d'urgence: ${navWorks ? 'FONCTIONNE' : 'ÉCHOUE'}`);
      }
      
    } else {
      console.log('❌ ÉCHEC: Système d\'urgence non fonctionnel');
    }
    
    // Capture finale
    await page.screenshot({ path: 'test-results/emergency-system.png', fullPage: true });
    console.log('📸 Capture du système d\'urgence sauvegardée');
  });
});
