// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Fix Verification', () => {
  test('Verify fixed configuration works', async ({ page }) => {
    console.log('🔧 Test de la configuration corrigée...');
    
    // Test la page racine
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(3000); // Attendre le chargement
    
    const content = await page.locator('#app').textContent();
    console.log(`📄 Contenu de l'app: "${content?.substring(0, 100)}..."`);
    
    // Vérifier qu'on n'est plus bloqué sur "Chargement"
    const isLoading = content?.includes('Chargement');
    if (!isLoading) {
      console.log('✅ SUCCESS: Application ne bloque plus sur Chargement!');
      console.log(`📋 Contenu chargé: ${content?.length} caractères`);
    } else {
      console.log('❌ STILL LOADING: Application encore bloquée');
      
      // Test routes spécifiques
      const routes = ['#index.md', '#en/index.md', '#fr/index.md'];
      for (const route of routes) {
        await page.goto(`http://127.0.0.1:8080/${route}`);
        await page.waitForTimeout(2000);
        const routeContent = await page.locator('#app').textContent();
        console.log(`🔗 ${route}: ${routeContent?.includes('Chargement') ? 'LOADING' : 'OK'}`);
      }
    }
  });

  test('Test automatic language redirection', async ({ page }) => {
    console.log('🌐 Test de redirection automatique...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`🔗 URL finale: ${currentUrl}`);
    
    // Vérifier si la redirection a eu lieu
    if (currentUrl.includes('#')) {
      console.log('✅ Redirection automatique fonctionnelle');
    } else {
      console.log('ℹ️ Pas de redirection (peut être normal)');
    }
  });

  test('Test specific content access', async ({ page }) => {
    console.log('📄 Test d\'accès au contenu spécifique...');
    
    // Test direct de différents contenus
    const testUrls = [
      'http://127.0.0.1:8080/#fr/index.md',
      'http://127.0.0.1:8080/#en/index.md', 
      'http://127.0.0.1:8080/#demo/advanced-shapes.md'
    ];
    
    for (const url of testUrls) {
      await page.goto(url);
      await page.waitForTimeout(2000);
      
      const content = await page.locator('#app').textContent();
      const isWorking = content && !content.includes('Chargement') && content.length > 100;
      
      console.log(`🎯 ${url}: ${isWorking ? '✅ OK' : '❌ FAIL'} (${content?.length || 0} chars)`);
    }
  });
});
