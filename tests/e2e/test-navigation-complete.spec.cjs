const { test, expect } = require('@playwright/test');

/**
 * Tests complets pour la navigation principale OntoWave
 * Valide : page d'accueil, menus, boutons de langue, liens de navigation
 */

test.describe('🏠 Navigation Principale OntoWave', () => {
  
  test.beforeEach(async ({ page }) => {
    // Démarrer à la page d'accueil
    await page.goto('http://localhost:8080/');
    // Attendre que OntoWave soit chargé
    await page.waitForTimeout(2000);
  });

  test('Page d\'accueil se charge correctement', async ({ page }) => {
    console.log('=== TEST PAGE D\'ACCUEIL ===');
    
    // Vérifier le titre
    await expect(page).toHaveTitle(/OntoWave/);
    
    // Vérifier que OntoWave est chargé
    const ontoWavePresent = await page.evaluate(() => window.OntoWave !== undefined);
    expect(ontoWavePresent).toBe(true);
    console.log('✅ OntoWave chargé');
    
    // Vérifier le contenu principal
    const mainContent = await page.locator('main, #ontowave-content, body').first();
    await expect(mainContent).toBeVisible();
    
    // Vérifier qu'il y a du contenu rendu
    const contentText = await mainContent.textContent();
    expect(contentText.length).toBeGreaterThan(100);
    console.log(`✅ Contenu principal rendu (${contentText.length} caractères)`);
  });

  test('Menu hamburger fonctionne', async ({ page }) => {
    console.log('=== TEST MENU HAMBURGER ===');
    
    // Chercher l'icône de menu OntoWave
    const menuIcon = page.locator('.ontowave-menu-icon, [class*="menu"], [onclick*="menu"], .ow-toggle');
    await expect(menuIcon.first()).toBeVisible({ timeout: 10000 });
    
    // Cliquer sur le menu
    await menuIcon.first().click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le menu s'ouvre
    const menuPanel = page.locator('.ontowave-menu, [class*="menu-panel"], .ow-menu');
    await expect(menuPanel.first()).toBeVisible();
    console.log('✅ Menu hamburger s\'ouvre');
    
    // Vérifier les éléments du menu
    const menuItems = await page.locator('.ontowave-menu a, .ontowave-menu button, .ow-menu a, .ow-menu button').count();
    expect(menuItems).toBeGreaterThan(0);
    console.log(`✅ Menu contient ${menuItems} éléments`);
  });

  test('Boutons de langue sont présents et fonctionnels', async ({ page }) => {
    console.log('=== TEST BOUTONS DE LANGUE ===');
    
    // Attendre que les boutons de langue soient chargés
    await page.waitForTimeout(3000);
    
    // Chercher les boutons de langue (dans le menu ou fixes)
    const langButtons = await page.locator('[onclick*="setLanguage"], [data-lang], .lang-btn, [class*="lang"]').all();
    expect(langButtons.length).toBeGreaterThan(0);
    console.log(`✅ ${langButtons.length} boutons de langue trouvés`);
    
    // Vérifier qu'on peut cliquer sur un bouton de langue
    if (langButtons.length > 0) {
      const currentContent = await page.textContent('body');
      await langButtons[0].click();
      await page.waitForTimeout(2000);
      
      // Le contenu devrait avoir potentiellement changé ou au moins réagi
      console.log('✅ Bouton de langue cliquable');
    }
  });

  test('Navigation vers sections principales', async ({ page }) => {
    console.log('=== TEST NAVIGATION SECTIONS ===');
    
    // Attendre le chargement complet
    await page.waitForTimeout(3000);
    
    // Vérifier qu'il y a des liens de navigation internes
    const internalLinks = await page.locator('a[href^="#"], a[href*="index"]').all();
    console.log(`✅ ${internalLinks.length} liens internes trouvés`);
    
    // Tester la navigation vers une ancre si elle existe
    const anchors = await page.locator('a[href^="#"]').all();
    if (anchors.length > 0) {
      const href = await anchors[0].getAttribute('href');
      await anchors[0].click();
      await page.waitForTimeout(1000);
      
      // Vérifier que l'URL a changé
      const currentUrl = page.url();
      expect(currentUrl).toContain(href);
      console.log(`✅ Navigation vers ancre ${href} fonctionne`);
    }
  });

  test('Liens vers les démos sont présents et valides', async ({ page }) => {
    console.log('=== TEST LIENS DÉMOS ===');
    
    // Attendre le chargement
    await page.waitForTimeout(3000);
    
    // Chercher les liens vers les démos
    const demoLinks = await page.locator('a[href*="demo"]').all();
    expect(demoLinks.length).toBeGreaterThan(0);
    console.log(`✅ ${demoLinks.length} liens vers démos trouvés`);
    
    // Vérifier quelques liens de démo
    for (let i = 0; i < Math.min(3, demoLinks.length); i++) {
      const href = await demoLinks[i].getAttribute('href');
      console.log(`🔗 Lien démo ${i + 1}: ${href}`);
      
      if (href && !href.startsWith('http')) {
        // Vérifier que la page de démo existe
        const response = await page.request.get(`http://localhost:8080/${href}`);
        expect(response.status()).toBe(200);
        console.log(`✅ Démo ${href} accessible`);
      }
    }
  });

  test('Structure HTML et CSS cohérente', async ({ page }) => {
    console.log('=== TEST STRUCTURE HTML ===');
    
    // Vérifier les éléments essentiels
    await expect(page.locator('head')).toBeAttached();
    await expect(page.locator('body')).toBeAttached();
    
    // Vérifier que OntoWave a rendu du contenu
    const renderedElements = await page.locator('[class*="ontowave"], [class*="ow-"], [id*="ontowave"]').count();
    expect(renderedElements).toBeGreaterThan(0);
    console.log(`✅ ${renderedElements} éléments OntoWave rendus`);
    
    // Vérifier qu'il n'y a pas d'erreurs JavaScript critiques
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Filtrer les erreurs non critiques
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('404') && 
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Pas d\'erreurs JavaScript critiques');
  });

  test('Performance et temps de chargement', async ({ page }) => {
    console.log('=== TEST PERFORMANCE ===');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    // Le chargement ne devrait pas prendre plus de 10 secondes
    expect(loadTime).toBeLessThan(10000);
    
    // Vérifier que OntoWave est initialisé rapidement
    const ontoWaveReady = await page.waitForFunction(() => {
      return window.OntoWave && typeof window.OntoWave === 'object';
    }, { timeout: 5000 });
    
    expect(ontoWaveReady).toBeTruthy();
    console.log('✅ OntoWave initialisé rapidement');
  });
});
