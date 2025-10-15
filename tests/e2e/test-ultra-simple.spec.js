import { test, expect } from '@playwright/test';

test('test ultra simple OntoWave', async ({ page }) => {
  // Écouter la console
  page.on('console', msg => console.log('🖥️  Console:', msg.text()));
  
  // Aller à la page ultra simple
  await page.goto('http://127.0.0.1:8090/test-ultra-simple.html');
  
  // Attendre plus longtemps pour le chargement
  await page.waitForTimeout(5000);
  
  // Vérifier le contenu
  const content = await page.locator('#content').textContent();
  console.log('📄 Contenu:', content.substring(0, 100));
  
  // Chercher des tableaux
  const tableCount = await page.locator('table').count();
  console.log('📊 Nombre de tableaux:', tableCount);
  
  if (tableCount > 0) {
    console.log('✅ Tables trouvées !');
    
    // Vérifier les styles
    const firstTable = page.locator('table').first();
    const styles = await firstTable.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderCollapse: computed.borderCollapse,
        width: computed.width
      };
    });
    console.log('🎨 Styles tableau:', styles);
  }
  
  // Capture d'écran
  await page.screenshot({
    path: 'TEST-ULTRA-SIMPLE-ONTOWAVE.png',
    fullPage: true
  });
  
  console.log('🔍 Test ultra simple terminé');
});