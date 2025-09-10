import { test, expect } from '@playwright/test';

test.describe('OntoWave Loading Strategies', () => {
  test('should load from local source when available', async ({ page }) => {
    await page.goto('http://localhost:8080/hybrid-loading.html');
    
    // Écouter les messages de console
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Attendre le chargement
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    // Vérifier qu'OntoWave est chargé
    const hasOntoWave = await page.evaluate(() => typeof window.OntoWave);
    expect(hasOntoWave).toBe('function');
    
    // Vérifier les logs pour voir la source utilisée
    const loadingLog = consoleLogs.find(log => log.includes('OntoWave chargé depuis'));
    if (loadingLog) {
      console.log(`📦 ${loadingLog}`);
      expect(loadingLog).toContain('LOCAL');
    }
    
    console.log('✅ Chargement hybride fonctionnel');
  });
  
  test('should work with GitHub Pages approach', async ({ page }) => {
    await page.goto('http://localhost:8080/docs/');
    
    // Attendre le chargement OntoWave
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    // Vérifier que l'interface est créée
    await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Approche GitHub Pages fonctionnelle');
  });
  
  test('should handle loading failures gracefully', async ({ page }) => {
    // Modifier temporairement la page pour simuler un échec
    await page.goto('http://localhost:8080/hybrid-loading.html');
    
    // Bloquer tous les scripts OntoWave pour simuler un échec
    await page.route('**/ontowave*.js', route => route.abort());
    
    // Recharger la page
    await page.reload();
    
    // Attendre un peu
    await page.waitForTimeout(3000);
    
    // Vérifier qu'un message d'erreur est affiché
    const errorText = page.locator('text=Erreur de Chargement OntoWave');
    await expect(errorText).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Gestion d\'erreur fonctionnelle');
  });
});
