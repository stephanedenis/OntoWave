// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Hash Preservation Test', () => {
  test('Verify hash preservation after fix implementation', async ({ page }) => {
    console.log('🔍 Test de préservation des hash après implémentation du fix...');
    
    // Capturer les logs pour voir le fix en action
    page.on('console', msg => {
      if (msg.text().includes('🔗') || msg.text().includes('Fix') || msg.text().includes('hash')) {
        console.log(`📱 ${msg.text()}`);
      }
    });
    
    // Aller à la page d'accueil
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(6000); // Laisser temps au fix et au système de secours
    
    console.log(`🏠 URL initiale: ${page.url()}`);
    
    // Test 1: Navigation vers English
    console.log('\n🧪 Test 1: Navigation vers page anglaise');
    const englishLink = page.locator('a[href="#en/index.md"]').first();
    
    if (await englishLink.count() > 0) {
      const beforeUrl = page.url();
      console.log(`📍 Avant clic: ${beforeUrl}`);
      
      await englishLink.click();
      await page.waitForTimeout(2000);
      
      const afterUrl = page.url();
      console.log(`📍 Après clic: ${afterUrl}`);
      
      const hashPreserved = afterUrl.includes('#en/index.md');
      console.log(`✅ Hash préservé: ${hashPreserved ? 'OUI' : 'NON'}`);
      
      expect(hashPreserved).toBe(true);
    }
    
    // Test 2: Navigation vers Français
    console.log('\n🧪 Test 2: Navigation vers page française');
    const frenchLink = page.locator('a[href="#fr/index.md"]').first();
    
    if (await frenchLink.count() > 0) {
      await frenchLink.click();
      await page.waitForTimeout(2000);
      
      const urlAfterFrench = page.url();
      console.log(`📍 URL française: ${urlAfterFrench}`);
      
      const frenchHashOk = urlAfterFrench.includes('#fr/index.md');
      console.log(`✅ Navigation française: ${frenchHashOk ? 'OUI' : 'NON'}`);
      
      expect(frenchHashOk).toBe(true);
    }
    
    // Test 3: Navigation vers démos PowerPoint
    console.log('\n🧪 Test 3: Navigation vers démos PowerPoint');
    const demoLink = page.locator('a[href="#demo/advanced-shapes.md"]').first();
    
    if (await demoLink.count() > 0) {
      await demoLink.click();
      await page.waitForTimeout(3000);
      
      const demoUrl = page.url();
      console.log(`📍 URL démo: ${demoUrl}`);
      
      const demoHashOk = demoUrl.includes('#demo/advanced-shapes.md');
      console.log(`✅ Navigation démo: ${demoHashOk ? 'OUI' : 'NON'}`);
      
      // Vérifier que le contenu est chargé
      const content = await page.locator('#app').textContent();
      const contentLoaded = content && !content.includes('Chargement') && content.length > 200;
      console.log(`📄 Contenu chargé: ${contentLoaded ? 'OUI' : 'NON'} (${content?.length} chars)`);
      
      expect(demoHashOk).toBe(true);
      expect(contentLoaded).toBe(true);
    }
    
    // Test 4: Retour à l'accueil via lien
    console.log('\n🧪 Test 4: Retour à l\'accueil');
    const homeLink = page.locator('a[href="#index.md"]').first();
    
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await page.waitForTimeout(2000);
      
      const homeUrl = page.url();
      console.log(`📍 URL accueil: ${homeUrl}`);
      
      const homeHashOk = homeUrl.includes('#index.md');
      console.log(`✅ Retour accueil: ${homeHashOk ? 'OUI' : 'NON'}`);
      
      expect(homeHashOk).toBe(true);
    }
    
    console.log('\n🎯 RÉSULTAT: Tous les tests de navigation hash réussis!');
  });

  test('Test navigation from different starting points', async ({ page }) => {
    console.log('🗺️ Test de navigation depuis différents points de départ...');
    
    const startingPoints = [
      { url: 'http://127.0.0.1:8080/', name: 'Racine' },
      { url: 'http://127.0.0.1:8080/#en/index.md', name: 'Page anglaise' },
      { url: 'http://127.0.0.1:8080/#fr/index.md', name: 'Page française' }
    ];
    
    for (const start of startingPoints) {
      console.log(`\n🚀 Départ depuis: ${start.name}`);
      
      await page.goto(start.url);
      await page.waitForTimeout(3000);
      
      console.log(`📍 URL de départ: ${page.url()}`);
      
      // Test navigation vers démo
      const demoLink = page.locator('a[href="#demo/advanced-shapes.md"]').first();
      if (await demoLink.count() > 0 && await demoLink.isVisible()) {
        await demoLink.click();
        await page.waitForTimeout(2000);
        
        const demoUrl = page.url();
        const success = demoUrl.includes('#demo/advanced-shapes.md');
        console.log(`✅ Navigation vers démo: ${success ? 'Réussie' : 'Échouée'}`);
      } else {
        console.log('⏭️ Lien démo non trouvé/visible');
      }
    }
    
    console.log('\n✅ Tests de navigation multi-points terminés');
  });
});
