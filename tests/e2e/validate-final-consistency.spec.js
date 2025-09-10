import { test, expect } from '@playwright/test';
import { access } from 'fs/promises';
import { stat } from 'fs/promises';

test('Validation finale de la cohérence et honnêteté', async ({ page }) => {
  // 1. Vérifier que les fichiers existent avec les bonnes tailles
  await test.step('Vérifier les tailles de fichiers', async () => {
    // Vérifier ontowave.min.js
    const minJsStats = await stat('/home/stephane/GitHub/OntoWave/docs/ontowave.min.js');
    const minJsSizeKB = Math.round(minJsStats.size / 1024);
    console.log(`ontowave.min.js: ${minJsSizeKB}KB`);
    expect(minJsSizeKB).toBe(18); // Doit être 18KB comme annoncé

    // Vérifier ontowave.js complet
    const fullJsStats = await stat('/home/stephane/GitHub/OntoWave/dist/ontowave.js');
    const fullJsSizeKB = Math.round(fullJsStats.size / 1024);
    console.log(`ontowave.js: ${fullJsSizeKB}KB`);
    expect(fullJsSizeKB).toBe(28);
  });

  // 2. Naviguer vers la page d'accueil
  await page.goto('http://localhost:8001/index.html');
  
  // 3. Vérifier que les tailles annoncées sont cohérentes
  await test.step('Vérifier les informations de taille sur la page', async () => {
    // Version française
    await expect(page.locator('#lang-fr')).toContainText('Seulement 18KB');
    await expect(page.locator('#lang-fr')).toContainText('(18KB) - Fichier unique');
    
    // Cliquer sur English pour vérifier la version anglaise
    await page.click('#btn-en');
    await expect(page.locator('#lang-en')).toContainText('Only 18KB');
    await expect(page.locator('#lang-en')).toContainText('(18KB) - Single file');
  });

  // 4. Vérifier qu'il n'y a plus de fausses références npm/CDN
  await test.step('Vérifier absence de fausses références', async () => {
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('npm install');
    expect(pageContent).not.toContain('cdn.jsdelivr.net');
    expect(pageContent).not.toContain('npmjs.com');
  });

  // 5. Vérifier la présence de la licence CC BY-NC-SA
  await test.step('Vérifier la licence', async () => {
    // Version française
    await page.click('#btn-fr');
    await expect(page.locator('#lang-fr')).toContainText('CC BY-NC-SA 4.0');
    await expect(page.locator('#lang-fr')).toContainText('dépôt GitHub');
    
    // Version anglaise
    await page.click('#btn-en');
    await expect(page.locator('#lang-en')).toContainText('CC BY-NC-SA 4.0');
    await expect(page.locator('#lang-en')).toContainText('GitHub repository');
    
    // Vérifier le logo CC
    await expect(page.locator('img[src*="creativecommons.org"]')).toBeVisible();
  });

  // 6. Vérifier que les liens de téléchargement fonctionnent
  await test.step('Vérifier les téléchargements', async () => {
    // Cliquer sur le lien de téléchargement du fichier minifié
    const [download1] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href="ontowave.min.js"]')
    ]);
    expect(download1.suggestedFilename()).toBe('ontowave.min.js');

    // Cliquer sur le lien de téléchargement du dist complet
    const [download2] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href="dist.tar.gz"]')
    ]);
    expect(download2.suggestedFilename()).toBe('dist.tar.gz');
  });

  // 7. Prendre une capture d'écran finale
  await page.screenshot({ 
    path: 'tests/screenshots/final-consistent-page.png', 
    fullPage: true 
  });
});

test('Validation des exemples de code', async ({ page }) => {
  await page.goto('http://localhost:8001/index.html');
  
  // Vérifier que les exemples de code sont visibles et corrects
  await test.step('Vérifier les blocs de code', async () => {
    // Le code HTML doit être affiché dans les exemples
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toContainText('<!DOCTYPE html>');
    await expect(codeBlocks.first()).toContainText('<script src="ontowave.min.js"></script>');
    
    // Pas de références à des CDN fictifs
    const allCodeText = await codeBlocks.allTextContents();
    for (const codeText of allCodeText) {
      expect(codeText).not.toContain('cdn.jsdelivr.net');
      expect(codeText).not.toContain('unpkg.com');
    }
  });
});
