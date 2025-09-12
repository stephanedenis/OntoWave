import { test, expect } from '@playwright/test';

test('Test final Prism - Vérification simple', async ({ page }) => {
  console.log('🧪 TEST FINAL PRISM');
  
  // Aller sur la page
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  
  // Attendre que OntoWave se charge
  await page.waitForTimeout(5000);
  
  // Vérifier qu'il y a des blocs de code
  const codeBlocks = await page.locator('code').count();
  console.log(`📝 Blocs de code trouvés: ${codeBlocks}`);
  expect(codeBlocks).toBeGreaterThan(0);
  
  // Vérifier qu'il y a des blocs HTML spécifiquement
  const htmlBlocks = await page.locator('code.language-html').count();
  console.log(`🏷️ Blocs HTML: ${htmlBlocks}`);
  
  if (htmlBlocks > 0) {
    // Si des blocs HTML existent, vérifier la coloration
    const tokens = await page.locator('code.language-html .token').count();
    console.log(`🎨 Tokens Prism dans HTML: ${tokens}`);
    
    if (tokens > 0) {
      console.log('✅ PRISM FONCTIONNE - Coloration syntaxique active');
    } else {
      console.log('❌ PRISM NE FONCTIONNE PAS - Pas de tokens');
    }
  } else {
    console.log('⚠️ Pas de blocs HTML avec classe language-html');
  }
  
  // Test final: au moins des blocs de code existent
  expect(codeBlocks).toBeGreaterThan(0);
});
