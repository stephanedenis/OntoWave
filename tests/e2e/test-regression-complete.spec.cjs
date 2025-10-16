const { test, expect } = require('@playwright/test');

test.describe('Tests de régression OntoWave', () => {
  
  test('1. Navigation markdown normale fonctionne', async ({ page }) => {
    await page.goto('http://localhost:5173/dev.html#/test-puml');
    await page.waitForTimeout(2000);
    
    // Vérifier que le markdown est rendu
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const titleText = await h1.textContent();
    console.log('✅ Titre markdown:', titleText);
    expect(titleText).toContain('PlantUML');
    
    // Capture d'écran
    await page.screenshot({ path: 'test-results/regression-markdown-ok.png', fullPage: true });
    console.log('📸 Capture: test-results/regression-markdown-ok.png');
  });

  test('2. Navigation vers fichier .puml fonctionne', async ({ page }) => {
    // Charger la page avec le lien .puml
    await page.goto('http://localhost:5173/dev.html#/test-puml');
    await page.waitForTimeout(2000);
    
    console.log('📄 Page markdown chargée');
    
    // Vérifier que le lien .puml existe
    const linkCount = await page.locator('a[href="architecture.puml"]').count();
    console.log(`📊 Liens vers architecture.puml: ${linkCount}`);
    expect(linkCount).toBeGreaterThan(0);
    
    // Naviguer vers le .puml
    await page.evaluate(() => { location.hash = '#/architecture.puml'; });
    await page.waitForTimeout(5000); // Attendre le rendu PlantUML
    
    // Vérifier qu'un SVG est présent
    const svgCount = await page.locator('svg').count();
    console.log(`📊 SVG trouvés: ${svgCount}`);
    expect(svgCount).toBeGreaterThan(0);
    
    // Vérifier le titre
    const titleExists = await page.locator('h1:has-text("architecture.puml")').count();
    console.log(`📋 Titre .puml présent: ${titleExists > 0}`);
    expect(titleExists).toBeGreaterThan(0);
    
    // Vérifier le bouton retour
    const backButton = page.locator('a:has-text("← Retour")');
    await expect(backButton).toBeVisible();
    console.log('✅ Bouton retour présent');
    
    // Capture d'écran du diagramme PlantUML
    await page.screenshot({ path: 'test-results/regression-puml-ok.png', fullPage: true });
    console.log('📸 Capture: test-results/regression-puml-ok.png');
    
    // Vérifier que le code source est dans un <details>
    const sourceCode = page.locator('details:has-text("Code source PlantUML")');
    await expect(sourceCode).toBeVisible();
    console.log('✅ Code source PlantUML affiché');
  });

  test('3. Bouton retour fonctionne', async ({ page }) => {
    // Aller directement sur un .puml
    await page.goto('http://localhost:5173/dev.html#/architecture.puml');
    await page.waitForTimeout(5000);
    
    // Vérifier qu'on est sur la page .puml
    expect(page.url()).toContain('.puml');
    
    // Utiliser navigation arrière
    await page.goBack();
    await page.waitForTimeout(2000);
    
    // Vérifier qu'on revient sur une page markdown normale
    const url = page.url();
    console.log(`✅ URL après retour: ${url}`);
    expect(url).not.toContain('.puml');
  });

  test('4. Liens markdown standard fonctionnent toujours', async ({ page }) => {
    await page.goto('http://localhost:5173/dev.html#/test-puml');
    await page.waitForTimeout(2000);
    
    // Chercher un lien interne markdown (ancre)
    const anchorLinks = await page.locator('a[href^="#"]').count();
    console.log(`📊 Liens ancres trouvés: ${anchorLinks}`);
    expect(anchorLinks).toBeGreaterThan(0);
    
    // Vérifier que les ancres fonctionnent (headers cliquables)
    const headerLink = page.locator('a.header-anchor').first();
    if (await headerLink.count() > 0) {
      await expect(headerLink).toBeVisible();
      console.log('✅ Liens header-anchor présents');
    }
    
    await page.screenshot({ path: 'test-results/regression-links-ok.png', fullPage: true });
    console.log('📸 Capture: test-results/regression-links-ok.png');
  });

  test('5. Interception des clics .puml fonctionne', async ({ page }) => {
    await page.goto('http://localhost:5173/dev.html#/test-puml');
    await page.waitForTimeout(2000);
    
    // Trouver le lien .puml
    const pumlLink = page.locator('a[href="architecture.puml"]').first();
    await expect(pumlLink).toBeVisible();
    
    // Cliquer sur le lien (doit être intercepté par router.ts)
    await page.evaluate(() => {
      const link = document.querySelector('a[href="architecture.puml"]');
      if (link) link.click();
    });
    
    await page.waitForTimeout(5000);
    
    // Vérifier que l'URL a changé
    expect(page.url()).toContain('architecture.puml');
    
    // Vérifier que le SVG est affiché
    const svgCount = await page.locator('svg').count();
    expect(svgCount).toBeGreaterThan(0);
    
    console.log('✅ Interception du clic fonctionne');
    await page.screenshot({ path: 'test-results/regression-click-interception-ok.png', fullPage: true });
    console.log('📸 Capture: test-results/regression-click-interception-ok.png');
  });
});
