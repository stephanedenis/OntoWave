// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave JavaScript Debug', () => {
  test('Capture JavaScript errors and debug info', async ({ page }) => {
    const errors = [];
    const logs = [];
    
    // Capturer toutes les erreurs et logs
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    page.on('requestfailed', request => {
      errors.push(`Request failed: ${request.url()}`);
    });
    
    console.log('🔍 Début du debug JavaScript...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(5000); // Attendre plus longtemps
    
    console.log('📊 Résumé des erreurs:');
    console.log(`Total erreurs: ${errors.length}`);
    console.log(`Total logs: ${logs.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Erreurs détectées:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    if (logs.length > 0) {
      console.log('📝 Logs (premiers 10):');
      logs.slice(0, 10).forEach((log, i) => console.log(`  ${i + 1}. ${log}`));
    }
    
    // Test des ressources chargées
    const scripts = await page.locator('script[src]').all();
    console.log(`📜 Scripts trouvés: ${scripts.length}`);
    
    for (const script of scripts) {
      const src = await script.getAttribute('src');
      if (src) {
        console.log(`📄 Script: ${src}`);
      }
    }
    
    // Vérifier l'état de l'application
    const appElement = await page.locator('#app').first();
    const appContent = await appElement.textContent();
    const appHTML = await appElement.innerHTML();
    
    console.log(`📋 App Content: "${appContent?.substring(0, 200)}..."`);
    console.log(`🏷️ App HTML length: ${appHTML?.length || 0}`);
    
    // Essayer d'exécuter du JavaScript dans la page pour voir l'état
    const browserInfo = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        href: location.href,
        hash: location.hash,
        readyState: document.readyState,
        hasApp: !!document.getElementById('app'),
        appContent: document.getElementById('app')?.textContent?.substring(0, 100),
        windowError: window.onerror ? 'Error handler exists' : 'No error handler',
        scriptsCount: document.scripts.length
      };
    });
    
    console.log('🌐 Informations navigateur:');
    Object.entries(browserInfo).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  });

  test('Test manual content loading', async ({ page }) => {
    console.log('🔧 Test de chargement manuel...');
    
    await page.goto('http://127.0.0.1:8080/');
    
    // Essayer de forcer le chargement de contenu
    const result = await page.evaluate(async () => {
      try {
        // Test de fetch direct
        const response = await fetch('/index.md');
        const content = await response.text();
        
        // Essayer d'injecter le contenu directement
        const app = document.getElementById('app');
        if (app && content) {
          app.innerHTML = `<div style="padding: 20px; border: 2px solid green;">
            <h2>✅ Contenu chargé manuellement</h2>
            <pre>${content.substring(0, 500)}...</pre>
          </div>`;
          return { success: true, contentLength: content.length };
        }
        
        return { success: false, error: 'App element not found' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('📋 Résultat chargement manuel:', result);
    
    if (result.success) {
      await page.waitForTimeout(2000);
      const newContent = await page.locator('#app').textContent();
      console.log(`✅ Nouveau contenu: ${newContent?.substring(0, 100)}...`);
    }
  });
});
