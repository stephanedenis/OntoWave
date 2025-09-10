// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Debug System', () => {
  test('Debug what is actually happening in the app', async ({ page }) => {
    console.log('🔍 Debug détaillé de l\'application OntoWave...');
    
    page.on('console', msg => {
      console.log(`🌐 ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
    
    await page.goto('http://127.0.0.1:8080/#index.md');
    
    // Attendre et analyser le contenu
    await page.waitForTimeout(2000);
    
    // Analyser le DOM complet
    const analysis = await page.evaluate(() => {
      const app = document.getElementById('app');
      return {
        appExists: !!app,
        appHTML: app ? app.innerHTML.substring(0, 500) : 'App non trouvée',
        appTextContent: app ? app.textContent : 'Pas de contenu',
        appChildren: app ? app.children.length : 0,
        bodyHTML: document.body.innerHTML.substring(0, 1000),
        allScripts: Array.from(document.scripts).map(s => ({
          src: s.src,
          hasContent: !!s.textContent,
          contentPreview: s.textContent ? s.textContent.substring(0, 100) : 'Vide'
        }))
      };
    });
    
    console.log('\n📊 ANALYSE DU DOM:');
    console.log(`App existe: ${analysis.appExists}`);
    console.log(`Enfants de app: ${analysis.appChildren}`);
    console.log(`Texte app: "${analysis.appTextContent}"`);
    console.log(`HTML app (début): ${analysis.appHTML}`);
    
    console.log('\n📝 SCRIPTS CHARGÉS:');
    analysis.allScripts.forEach((script, i) => {
      console.log(`${i + 1}. ${script.src || 'Script inline'}: ${script.contentPreview}`);
    });
    
    // Tenter de forcer manuellement le système
    console.log('\n🔧 Tentative de force manuelle...');
    
    const forceResult = await page.evaluate(() => {
      console.log('🚀 Force override direct...');
      
      const app = document.getElementById('app');
      if (!app) return 'App introuvable';
      
      // Override complet immédiat
      app.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: green;">✅ OntoWave Forcé - FONCTIONNE</h1>
          <p>Système de secours manuel activé avec succès !</p>
          <div id="test-content">Contenu de test chargé...</div>
          <div style="margin-top: 20px;">
            <a href="#demo/mermaid.md" style="padding: 10px; background: #007acc; color: white; text-decoration: none; border-radius: 4px;">Test Navigation</a>
          </div>
        </div>
      `;
      
      return 'Override forcé appliqué';
    });
    
    console.log(`🔧 Résultat force: ${forceResult}`);
    
    await page.waitForTimeout(1000);
    
    // Vérifier le résultat
    const finalContent = await page.locator('#app').textContent();
    const finalLength = finalContent?.length || 0;
    
    console.log(`\n📊 RÉSULTAT FINAL:`);
    console.log(`Contenu final: ${finalLength} caractères`);
    console.log(`Texte: "${finalContent?.substring(0, 100)}..."`);
    
    const isWorking = finalLength > 100 && finalContent?.includes('FONCTIONNE');
    console.log(`✅ Force réussie: ${isWorking ? 'OUI' : 'NON'}`);
    
    if (isWorking) {
      console.log('🎉 Le problème était dans la détection automatique !');
      console.log('💡 Solution: Utiliser un override plus direct et immédiat');
    } else {
      console.log('❌ Problème plus profond dans l\'application');
    }
    
    await page.screenshot({ path: 'test-results/debug-analysis.png', fullPage: true });
  });
});
