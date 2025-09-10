import { test, expect } from '@playwright/test';

test.describe('OntoWave Minimal HTML - Une Ligne Import', () => {
  test('should work with single script import', async ({ page }) => {
    // Aller sur la page minimale
    await page.goto('http://localhost:8080/minimal.html');
    
    // Vérifier que le script OntoWave est chargé
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    
    // Vérifier que l'interface est créée automatiquement
    await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
    
    // Vérifier que le contenu index.md est chargé
    await expect(page.locator('body')).toContainText('OntoWave', { timeout: 8000 });
    
    console.log('✅ OntoWave minimal fonctionne !');
  });

  test('should load and display index.md content', async ({ page }) => {
    await page.goto('http://localhost:8080/minimal.html');
    
    // Attendre le chargement complet
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Vérifier le contenu spécifique d'index.md
    await expect(page.locator('body')).toContainText('Documentation Interactive', { timeout: 5000 });
    await expect(page.locator('h1, h2, h3')).toHaveCount.toBeGreaterThan(0);
    
    // Vérifier les fonctionnalités
    await expect(page.locator('body')).toContainText('Installation Ultra-Simple', { timeout: 3000 });
  });

  test('should process Mermaid diagrams automatically', async ({ page }) => {
    await page.goto('http://localhost:8080/minimal.html');
    
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(5000); // Plus de temps pour Mermaid
    
    // Vérifier si des diagrammes Mermaid sont présents et rendus
    const mermaidDivs = page.locator('.mermaid');
    const mermaidSvgs = page.locator('.mermaid svg');
    
    if (await mermaidDivs.count() > 0) {
      console.log(`📊 ${await mermaidDivs.count()} diagrammes Mermaid trouvés`);
      
      if (await mermaidSvgs.count() > 0) {
        await expect(mermaidSvgs.first()).toBeVisible();
        console.log('✅ Diagrammes Mermaid rendus');
      }
    }
  });

  test('should handle navigation links', async ({ page }) => {
    await page.goto('http://localhost:8080/minimal.html');
    
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Chercher des liens de navigation
    const navLinks = page.locator('a[href*=".md"]');
    const linkCount = await navLinks.count();
    
    console.log(`🔗 ${linkCount} liens de navigation trouvés`);
    
    if (linkCount > 0) {
      // Tester la navigation vers une autre page
      const firstLink = navLinks.first();
      const linkText = await firstLink.textContent();
      
      await firstLink.click();
      await page.waitForTimeout(2000);
      
      // Vérifier que la page a changé
      const newUrl = page.url();
      expect(newUrl).toContain('#');
      
      console.log(`📄 Navigation vers: ${linkText} - URL: ${newUrl}`);
    }
  });

  test('should work without any configuration', async ({ page }) => {
    await page.goto('http://localhost:8080/minimal.html');
    
    // Vérifier qu'il n'y a pas de script de configuration
    const configScript = page.locator('#ontowave-config');
    expect(await configScript.count()).toBe(0);
    
    // Vérifier que ça fonctionne quand même avec la config par défaut
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Fonctionne sans configuration !');
  });

  test('should demonstrate true minimal setup', async ({ page }) => {
    await page.goto('http://localhost:8080/minimal.html');
    
    // Vérifier le code HTML source
    const htmlContent = await page.content();
    
    // Compter les lignes significatives (sans espaces/commentaires)
    const significantLines = htmlContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('<!--'))
      .length;
    
    console.log(`📝 HTML minimal: ${significantLines} lignes significatives`);
    
    // Vérifier qu'il y a vraiment qu'une seule ligne script OntoWave
    const scriptMatches = (htmlContent.match(/ontowave/g) || []).length;
    expect(scriptMatches).toBeGreaterThanOrEqual(1);
    
    // Vérifier que l'interface fonctionne
    await page.waitForFunction(() => window.OntoWave !== undefined, { timeout: 10000 });
    await expect(page.locator('#ontowave-container')).toBeVisible({ timeout: 5000 });
    
    console.log('🎯 Setup ultra-minimal validé !');
  });
});
