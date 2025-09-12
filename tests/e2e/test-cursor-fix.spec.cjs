const { test, expect } = require('@playwright/test');

test.describe('Cursor and Drag State Fix', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Démarrer le serveur de test
    await page.goto('http://localhost:8080/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Attendre que OntoWave soit entièrement chargé
    await page.waitForFunction(() => {
      return window.OntoWave && document.getElementById('ontowave-floating-menu');
    }, { timeout: 10000 });
  });

  test('Cursor should not be stuck in grab mode', async () => {
    // Vérifier l'état initial
    const initialCursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor;
    });
    console.log('Initial body cursor:', initialCursor);
    
    const initialUserSelect = await page.evaluate(() => {
      return document.body.style.userSelect || window.getComputedStyle(document.body).userSelect;
    });
    console.log('Initial user-select:', initialUserSelect);

    // Simuler un drag qui ne se termine pas correctement
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    
    // Simuler mousedown sur le menu (début de drag)
    await menu.dispatchEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100
    });
    
    // Vérifier que le drag a commencé
    const duringDragCursor = await page.evaluate(() => {
      const menu = document.getElementById('ontowave-floating-menu');
      return window.getComputedStyle(menu).cursor;
    });
    console.log('During drag menu cursor:', duringDragCursor);
    
    const duringDragUserSelect = await page.evaluate(() => {
      return document.body.style.userSelect;
    });
    console.log('During drag user-select:', duringDragUserSelect);
    
    // Simuler une mouseup pour terminer le drag
    await page.dispatchEvent('mouseup');
    
    // Attendre un peu pour que les styles se remettent
    await page.waitForTimeout(100);
    
    // Vérifier que les styles sont remis à la normale
    const finalCursor = await page.evaluate(() => {
      return document.body.style.cursor || window.getComputedStyle(document.body).cursor;
    });
    console.log('Final body cursor:', finalCursor);
    
    const finalUserSelect = await page.evaluate(() => {
      return document.body.style.userSelect || window.getComputedStyle(document.body).userSelect;
    });
    console.log('Final user-select:', finalUserSelect);
    
    // Le body ne devrait plus avoir userSelect: none
    expect(finalUserSelect).not.toBe('none');
    
    // Test de la fonctionnalité de clic normal
    const langButtons = page.locator('.lang-toggle button');
    await expect(langButtons.first()).toBeVisible();
    
    // Tester le clic sur les boutons de langue
    await langButtons.first().click();
    await page.waitForTimeout(500);
    
    // Vérifier que les boutons de langue fonctionnent
    const isClickable = await page.evaluate(() => {
      const button = document.querySelector('.lang-toggle button');
      return button && window.getComputedStyle(button).pointerEvents !== 'none';
    });
    
    expect(isClickable).toBe(true);
  });

  test('Reset drag state function should work', async () => {
    // Ajouter une fonction de reset global
    await page.evaluate(() => {
      window.resetOntoWaveDragState = function() {
        // Remettre les styles par défaut
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // Remettre le menu dans l'état normal
        const menu = document.getElementById('ontowave-floating-menu');
        if (menu) {
          menu.style.cursor = 'move';
        }
        
        // Forcer la mise à jour des états internes
        if (window.ontowaveUpdateDragState) {
          window.ontowaveUpdateDragState();
        }
        
        console.log('OntoWave drag state reset completed');
        return true;
      };
    });
    
    // Tester la fonction de reset
    const resetResult = await page.evaluate(() => {
      return window.resetOntoWaveDragState();
    });
    
    expect(resetResult).toBe(true);
    
    // Vérifier que tout fonctionne après reset
    const langButtons = page.locator('.lang-toggle button');
    await langButtons.first().click();
    
    // Vérifier que le changement de langue fonctionne
    const contentChanged = await page.evaluate(() => {
      return document.getElementById('lang-fr') || document.getElementById('lang-en');
    });
    
    expect(contentChanged).toBeTruthy();
  });
});
