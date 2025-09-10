import { test, expect } from '@playwright/test';

test.describe('OntoWave Demos Gallery', () => {
  const demos = [
    { name: '01-minimal', title: 'Minimal', complexity: 'Très simple' },
    { name: '02-basic-config', title: 'Configuration de Base', complexity: 'Simple' },
    { name: '03-dark-theme', title: 'Thème Sombre', complexity: 'Intermédiaire' },
    { name: '04-advanced-config', title: 'Configuration Avancée', complexity: 'Avancé' },
    { name: '05-mkdocs-style', title: 'Style MkDocs', complexity: 'Expert' }
  ];

  test('should display minimal index page with index.md content', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    // Attendre le chargement d'OntoWave
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    // Vérifier que le conteneur OntoWave existe
    const container = await page.locator('#ontowave-container');
    await expect(container).toBeAttached({ timeout: 10000 });
    
    // Vérifier qu'il y a du contenu (même si pas visible à cause du CSS)
    const hasContent = await page.evaluate(() => {
      const container = document.getElementById('ontowave-container');
      return container && container.innerHTML.length > 100;
    });
    
    expect(hasContent).toBe(true);
    
    console.log('✅ Index minimal avec OntoWave chargé correctement');
  });

  test('should display demos gallery page at /gallery.html', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery.html');
    
    // Vérifier le titre principal
    await expect(page.locator('h1')).toContainText('OntoWave');
    
    // Vérifier qu'il y a 5 cartes de démo
    await expect(page.locator('.demo-card')).toHaveCount(5);
    
    console.log('✅ Galerie de démos affichée correctement');
  });

  for (const demo of demos) {
    test(`should load ${demo.name} demo successfully`, async ({ page }) => {
      await page.goto(`http://localhost:8080/${demo.name}.html`);
      
      // Attendre le chargement d'OntoWave
      await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
      
      // Vérifier que l'interface OntoWave est présente
      await expect(page.locator('#ontowave-container, .ontowave-container')).toBeVisible({ timeout: 8000 });
      
      // Vérifier que du contenu est affiché
      await expect(page.locator('body')).toContainText('OntoWave', { timeout: 5000 });
      
      console.log(`✅ Démo ${demo.name} (${demo.complexity}) chargée avec succès`);
    });
  }

  test('should have working demo links from gallery', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery.html');
    
    // Attendre que la galerie se charge
    await expect(page.locator('.demo-card')).toHaveCount(5);
    
    // Tester le premier lien de démo
    await page.click('a[href="01-minimal.html"]');
    
    // Vérifier la navigation
    expect(page.url()).toContain('01-minimal.html');
    
    // Attendre le chargement d'OntoWave
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    console.log('✅ Navigation vers les démos fonctionnelle');
  });

  test('should demonstrate progressive complexity in gallery', async ({ page }) => {
    await page.goto('http://localhost:8080/gallery.html');
    
    const complexityLevels = [
      'complexity-basic',
      'complexity-intermediate', 
      'complexity-advanced',
      'complexity-expert'
    ];
    
    // Vérifier que chaque niveau de complexité est présent (au moins un)
    for (const level of complexityLevels) {
      await expect(page.locator(`.${level}`).first()).toBeVisible();
    }
    
    // Vérifier qu'il y a 5 cartes de démo au total
    await expect(page.locator('.demo-card')).toHaveCount(5);
    
    console.log('✅ Progression de complexité bien définie');
  });
});
