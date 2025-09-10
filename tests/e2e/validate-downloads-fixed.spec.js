import { test, expect } from '@playwright/test';

test('Validation des téléchargements sans hash', async ({ page }) => {
  // Aller sur la page
  await page.goto('http://localhost:8080/index.html');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('.ontowave-container');
  
  // Vérifier le lien de téléchargement dist.tar.gz
  await test.step('Vérifier le lien dist.tar.gz', async () => {
    // Chercher le lien vers dist.tar.gz
    const distLink = page.locator('a[href="dist.tar.gz"]');
    await expect(distLink).toBeVisible();
    
    // Vérifier que le href ne contient pas de hash
    const href = await distLink.getAttribute('href');
    console.log('Lien dist.tar.gz:', href);
    
    expect(href).toBe('dist.tar.gz');
    expect(href).not.toContain('#');
    
    // Vérifier que le lien a l'attribut download
    const download = await distLink.getAttribute('download');
    expect(download).toBe('');
  });
  
  // Vérifier le lien de téléchargement ontowave.min.js
  await test.step('Vérifier le lien ontowave.min.js', async () => {
    // Chercher le lien vers ontowave.min.js
    const jsLink = page.locator('a[href="ontowave.min.js"]');
    await expect(jsLink).toBeVisible();
    
    // Vérifier que le href ne contient pas de hash
    const href = await jsLink.getAttribute('href');
    console.log('Lien ontowave.min.js:', href);
    
    expect(href).toBe('ontowave.min.js');
    expect(href).not.toContain('#');
    
    // Vérifier que le lien a l'attribut download
    const download = await jsLink.getAttribute('download');
    expect(download).toBe('');
  });
  
  // Tester que les fichiers sont réellement téléchargeables
  await test.step('Tester les téléchargements', async () => {
    // Test du téléchargement de dist.tar.gz
    const [download1] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href="dist.tar.gz"]')
    ]);
    expect(download1.suggestedFilename()).toBe('dist.tar.gz');
    
    // Test du téléchargement de ontowave.min.js
    const [download2] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href="ontowave.min.js"]')
    ]);
    expect(download2.suggestedFilename()).toBe('ontowave.min.js');
  });
  
  // Capture d'écran
  await page.screenshot({ 
    path: 'tests/screenshots/telechargements-corriges.png', 
    fullPage: true 
  });
});
