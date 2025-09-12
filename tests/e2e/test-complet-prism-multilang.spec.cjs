const { test, expect } = require('@playwright/test');

test.describe('Test complet OntoWave - Prism et Multilingue', () => {
  test.beforeEach(async ({ page }) => {
    // Capturer les erreurs console pour diagnostic
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erreur console:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.log('❌ Erreur page:', err.message);
    });

    // Aller à la page d'accueil
    await page.goto('http://localhost:8080/');
    
    // Attendre le chargement complet d'OntoWave
    await page.waitForTimeout(3000);
  });

  test('Chargement de la page et contenu markdown', async ({ page }) => {
    console.log('🧪 Test 1: Chargement de la page et contenu markdown');
    
    // Vérifier que le titre principal est affiché
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('OntoWave');
    console.log('✅ Titre principal "OntoWave" détecté');
    
    // Vérifier que le contenu markdown est chargé
    const content = await page.textContent('body');
    expect(content).toContain('Micro-application');
    console.log('✅ Contenu markdown chargé correctement');
  });

  test('Boutons de langue présents et fonctionnels', async ({ page }) => {
    console.log('🧪 Test 2: Boutons de langue présents et fonctionnels');
    
    // Attendre que les boutons de langue soient présents
    await page.waitForSelector('.lang-toggle button', { timeout: 5000 });
    
    const frButton = page.locator('#btn-fr');
    const enButton = page.locator('#btn-en');
    
    // Vérifier que les boutons sont visibles
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    console.log('✅ Boutons FR et EN visibles');
    
    // Vérifier le contenu français par défaut
    const frContent = page.locator('#lang-fr');
    await expect(frContent).toBeVisible();
    await expect(frContent).toContainText('Micro-application pour sites statiques');
    console.log('✅ Contenu français affiché par défaut');
    
    // Tester la bascule vers l'anglais
    await enButton.click();
    await page.waitForTimeout(500);
    
    const enContent = page.locator('#lang-en');
    await expect(enContent).toBeVisible();
    await expect(enContent).toContainText('Micro-application for static sites');
    
    // Vérifier que le contenu français est maintenant caché
    await expect(frContent).toBeHidden();
    console.log('✅ Bascule FR→EN fonctionnelle');
    
    // Retour au français
    await frButton.click();
    await page.waitForTimeout(500);
    
    await expect(frContent).toBeVisible();
    await expect(enContent).toBeHidden();
    console.log('✅ Bascule EN→FR fonctionnelle');
  });

  test('Coloration syntaxique Prism', async ({ page }) => {
    console.log('🧪 Test 3: Coloration syntaxique Prism');
    
    // Attendre que Prism soit chargé
    await page.waitForFunction(() => window.Prism !== undefined, { timeout: 10000 });
    console.log('✅ Prism.js chargé');
    
    // Vérifier qu'il y a des blocs de code HTML
    const codeBlocks = page.locator('pre code.language-html');
    const count = await codeBlocks.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ ${count} blocs de code HTML détectés`);
    
    // Vérifier que la coloration syntaxique est appliquée
    const firstBlock = codeBlocks.first();
    const innerHTML = await firstBlock.innerHTML();
    
    expect(innerHTML).toContain('<span');
    console.log('✅ Coloration syntaxique active (spans détectés)');
    
    // Vérifier que les mots-clés HTML sont colorés
    expect(innerHTML).toMatch(/<span[^>]*>(&lt;|\<)!DOCTYPE/);
    console.log('✅ Mots-clés HTML correctement colorés');
  });

  test('Menu flottant OntoWave', async ({ page }) => {
    console.log('🧪 Test 4: Menu flottant OntoWave');
    
    // Vérifier que le menu flottant est présent
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    console.log('✅ Menu flottant OntoWave visible');
    
    // Vérifier qu'il y a des boutons dans le menu
    const buttons = menu.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ ${buttonCount} boutons détectés dans le menu`);
  });

  test('Configuration et fonctionnalités avancées', async ({ page }) => {
    console.log('🧪 Test 5: Configuration et fonctionnalités avancées');
    
    // Vérifier que la configuration OntoWave est chargée
    const configLoaded = await page.evaluate(() => {
      return window.OntoWave && window.OntoWave.config;
    });
    
    expect(configLoaded).toBeTruthy();
    console.log('✅ Configuration OntoWave chargée');
    
    // Vérifier les liens de navigation
    const links = page.locator('a[href$=".html"]');
    const linkCount = await links.count();
    
    expect(linkCount).toBeGreaterThan(0);
    console.log(`✅ ${linkCount} liens de démo détectés`);
    
    // Vérifier que les emojis sont présents (interface moderne)
    const content = await page.textContent('body');
    expect(content).toMatch(/[📝🧜‍♀️🔍🎨⚡🚀]/);
    console.log('✅ Interface moderne avec emojis');
  });

  test('Responsive design et viewport', async ({ page }) => {
    console.log('🧪 Test 6: Responsive design et viewport');
    
    // Tester en mode mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Vérifier que les boutons de langue sont toujours visibles
    const langToggle = page.locator('.lang-toggle');
    await expect(langToggle).toBeVisible();
    console.log('✅ Boutons de langue visibles en mode mobile');
    
    // Vérifier que le contenu s'adapte
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    console.log('✅ Menu OntoWave adapté au mobile');
    
    // Retour au mode desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    await expect(langToggle).toBeVisible();
    console.log('✅ Interface responsive validée');
  });

  test('Sauvegarde de préférence linguistique', async ({ page }) => {
    console.log('🧪 Test 7: Sauvegarde de préférence linguistique');
    
    // Basculer vers l'anglais
    await page.click('#btn-en');
    await page.waitForTimeout(500);
    
    // Vérifier que la préférence est sauvée dans localStorage
    const savedLang = await page.evaluate(() => {
      return localStorage.getItem('ontowave-lang');
    });
    
    expect(savedLang).toBe('en');
    console.log('✅ Préférence langue sauvée dans localStorage');
    
    // Recharger la page
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Vérifier que l'anglais est toujours actif
    const enContent = page.locator('#lang-en');
    await expect(enContent).toBeVisible();
    console.log('✅ Préférence langue restaurée après rechargement');
  });
});
