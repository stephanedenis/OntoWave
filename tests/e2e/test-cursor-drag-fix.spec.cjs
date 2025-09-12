const { test, expect } = require('@playwright/test');

test.describe('Fix: Curseur bloqué en mode glisser', () => {
  test('Les boutons de langue fonctionnent et le curseur reste normal', async ({ page }) => {
    // Aller à la page
    await page.goto('http://localhost:8080/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Attendre le chargement complet
    await page.waitForFunction(() => {
      return window.OntoWave && document.getElementById('ontowave-floating-menu');
    }, { timeout: 10000 });
    
    console.log('✅ Page chargée');
    
    // Vérifier l'état initial du curseur
    const initialBodyCursor = await page.evaluate(() => {
      return {
        cursor: document.body.style.cursor || window.getComputedStyle(document.body).cursor,
        userSelect: document.body.style.userSelect || window.getComputedStyle(document.body).userSelect
      };
    });
    console.log('🔍 État initial body:', initialBodyCursor);
    
    // Vérifier que les boutons de langue sont visibles et cliquables
    const langButtons = page.locator('.lang-toggle button');
    await expect(langButtons).toHaveCount(2);
    
    const frButton = page.locator('#btn-fr');
    const enButton = page.locator('#btn-en');
    
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    
    // Test 1: Cliquer sur le bouton EN
    console.log('🧪 Test clic EN...');
    await enButton.click();
    await page.waitForTimeout(500);
    
    // Vérifier que le contenu a changé
    const enContentVisible = await page.locator('#lang-en').isVisible();
    console.log('🇬🇧 Contenu EN visible:', enContentVisible);
    expect(enContentVisible).toBe(true);
    
    // Test 2: Cliquer sur le bouton FR
    console.log('🧪 Test clic FR...');
    await frButton.click();
    await page.waitForTimeout(500);
    
    // Vérifier que le contenu a changé
    const frContentVisible = await page.locator('#lang-fr').isVisible();
    console.log('🇫🇷 Contenu FR visible:', frContentVisible);
    expect(frContentVisible).toBe(true);
    
    // Test 3: Simuler un problème de drag et vérifier le reset
    console.log('🧪 Test reset drag state...');
    await page.evaluate(() => {
      // Simuler un état de drag bloqué
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      // Appeler la fonction de reset
      if (window.resetOntoWaveDragState) {
        window.resetOntoWaveDragState();
      }
    });
    
    // Vérifier que l'état est remis à la normale
    const resetState = await page.evaluate(() => {
      return {
        cursor: document.body.style.cursor,
        userSelect: document.body.style.userSelect
      };
    });
    console.log('🔄 État après reset:', resetState);
    
    // Le curseur et userSelect doivent être remis à la normale
    expect(resetState.cursor).toBe('');
    expect(resetState.userSelect).toBe('');
    
    // Test 4: Vérifier que les boutons fonctionnent encore après reset
    console.log('🧪 Test boutons après reset...');
    await enButton.click();
    await page.waitForTimeout(500);
    
    const enStillWorks = await page.locator('#lang-en').isVisible();
    console.log('🎯 EN fonctionne encore:', enStillWorks);
    expect(enStillWorks).toBe(true);
    
    // Test 5: Vérifier le menu OntoWave
    console.log('🧪 Test menu OntoWave...');
    const menuIcon = page.locator('#ontowave-menu-icon');
    await expect(menuIcon).toBeVisible();
    await menuIcon.click();
    await page.waitForTimeout(500);
    
    const menuExpanded = await page.locator('.ontowave-floating-menu.expanded').isVisible();
    console.log('🌊 Menu OntoWave étendu:', menuExpanded);
    expect(menuExpanded).toBe(true);
    
    // Fermer le menu
    await page.click('body');
    await page.waitForTimeout(300);
    
    // Test final: Vérifier que tout fonctionne normalement
    console.log('🧪 Test final de fonctionnement...');
    await frButton.click();
    await page.waitForTimeout(500);
    
    const finalState = await page.evaluate(() => {
      return {
        frVisible: document.getElementById('lang-fr')?.classList.contains('visible'),
        enVisible: document.getElementById('lang-en')?.classList.contains('visible'),
        bodyCursor: document.body.style.cursor,
        bodyUserSelect: document.body.style.userSelect
      };
    });
    
    console.log('🎉 État final:', finalState);
    
    // Assertions finales
    expect(finalState.frVisible).toBe(true);
    expect(finalState.enVisible).toBe(false);
    expect(finalState.bodyCursor).toBe('');
    expect(finalState.bodyUserSelect).toBe('');
    
    console.log('✅ TOUS LES TESTS PASSÉS - Le curseur fonctionne normalement !');
  });
});
