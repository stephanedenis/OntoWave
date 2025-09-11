import {   // Vérifier le lien GitHub dans la section licence française
  await test.step('Vérifier le lien GitHub français', async () => {
    // Cliquer sur français pour s'assurer que la section est visible
    await page.click('#btn-fr');
    await page.waitForSelector('#lang-fr', { state: 'visible' });
    
    // Chercher le lien "dépôt GitHub" (français uniquement)
    const githubLink = page.locator('#lang-fr a[href*="github.com/stephanedenis/OntoWave"]');
    await expect(githubLink).toBeVisible();t } from '@playwright/test';

test('Validation des liens externes sans hash', async ({ page }) => {
  // Lancer le serveur et aller sur la page
  await page.goto('http://localhost:8080/index.html');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('.ontowave-container');
  
  // Chercher le lien GitHub dans la section licence française
  await test.step('Vérifier le lien GitHub français', async () => {
    // Cliquer sur français si pas déjà affiché
    const frBtn = page.locator('#btn-fr');
    if (await frBtn.isVisible()) {
      await frBtn.click();
    }
    
    // Chercher le lien "dépôt GitHub" (français uniquement)
    const githubLink = page.locator('#lang-fr a[href*="github.com/stephanedenis/OntoWave"]');
    await expect(githubLink).toBeVisible();
    
    // Vérifier que le href ne contient pas de hash local
    const href = await githubLink.getAttribute('href');
    console.log('Lien GitHub français:', href);
    
    // Le lien doit être direct, pas avec un hash local
    expect(href).toBe('https://github.com/stephanedenis/OntoWave');
    expect(href).not.toContain('#https://');
    
    // Vérifier que le lien a target="_blank"
    const target = await githubLink.getAttribute('target');
    expect(target).toBe('_blank');
  });
  
  // Vérifier la section anglaise aussi
  await test.step('Vérifier le lien GitHub anglais', async () => {
    // Cliquer sur English
    await page.click('#btn-en');
    
    // Chercher le lien "GitHub repository" (anglais uniquement)
    const githubLink = page.locator('#lang-en a[href*="github.com/stephanedenis/OntoWave"]');
    await expect(githubLink).toBeVisible();
    
    // Vérifier que le href ne contient pas de hash local
    const href = await githubLink.getAttribute('href');
    console.log('Lien GitHub anglais:', href);
    
    expect(href).toBe('https://github.com/stephanedenis/OntoWave');
    expect(href).not.toContain('#https://');
    
    const target = await githubLink.getAttribute('target');
    expect(target).toBe('_blank');
  });
  
  // Prendre une capture d'écran pour validation
  await page.screenshot({ 
    path: 'tests/screenshots/liens-externes-corriges.png', 
    fullPage: true 
  });
});
