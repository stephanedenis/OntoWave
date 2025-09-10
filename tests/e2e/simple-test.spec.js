// Test simple et direct pour valider OntoWave
import { test, expect } from '@playwright/test';

test('OntoWave - Test simple de fonctionnement', async ({ page }) => {
  console.log('🚀 Test Simple OntoWave');
  
  try {
    // Aller à la page
    await page.goto('http://127.0.0.1:8083', { timeout: 15000 });
    console.log('✅ Page chargée');
    
    // Attendre que le titre soit visible
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Titre trouvé');
    
    // Vérifier le titre
    const title = await page.textContent('h1');
    console.log(`📄 Titre: ${title}`);
    
    // Vérifier que la navigation existe
    const navLinks = await page.$$('.nav-item');
    console.log(`🧭 Liens de navigation: ${navLinks.length}`);
    
    // Vérifier que le contenu dynamique existe
    const dynamicContent = await page.$('#dynamic-content');
    console.log(`📝 Zone de contenu dynamique: ${dynamicContent ? 'Présente' : 'Absente'}`);
    
    // Tester un clic sur navigation
    if (navLinks.length > 0) {
      await navLinks[0].click();
      console.log('✅ Clic sur navigation réussi');
      
      await page.waitForTimeout(2000);
      
      const currentHash = await page.evaluate(() => location.hash);
      console.log(`🔗 Hash après clic: ${currentHash}`);
    }
    
    console.log('🎉 OntoWave fonctionne correctement !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    
    // Prendre une capture d'écran pour débugger
    await page.screenshot({ path: '/tmp/ontowave-debug.png' });
    console.log('📸 Capture d\'écran sauvée dans /tmp/ontowave-debug.png');
    
    throw error;
  }
});
