import { test, expect } from '@playwright/test';

test('Validation des téléchargements et exemples corrects', async ({ page }) => {
  console.log('🧪 Test: Validation des liens de téléchargement et exemples HTML');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(3000);
  await page.waitForSelector('.ontowave-content', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Vérifier que les blocs de code contiennent le bon exemple
  const codeBlocks = await page.$$eval('pre code', elements => 
    elements.map(el => el.textContent?.trim() || '')
  );
  
  console.log('📝 Blocs de code trouvés:', codeBlocks.length);
  
  // Chercher le bloc qui contient l'exemple HTML correct
  const htmlExampleBlock = codeBlocks.find(block => 
    block.includes('<!DOCTYPE html>') && 
    block.includes('ontowave.min.js') &&
    !block.includes('cdn.jsdelivr') &&
    !block.includes('https://')
  );
  
  console.log('✅ Exemple HTML correct trouvé:', !!htmlExampleBlock);
  console.log('📋 Contenu exemple:', htmlExampleBlock?.substring(0, 150) + '...');
  
  // Vérifier les liens de téléchargement
  const downloadLinks = await page.$$eval('a[href*=".js"], a[href*=".tar.gz"]', links => 
    links.map(link => ({
      text: link.textContent?.trim(),
      href: link.href
    }))
  );
  
  console.log('📥 Liens de téléchargement:', downloadLinks);
  
  // Tester que le fichier ontowave.min.js est accessible
  const minJsResponse = await page.request.get('http://localhost:8080/ontowave.min.js');
  console.log('📦 ontowave.min.js accessible:', minJsResponse.ok());
  
  // Tester que le fichier dist.tar.gz est accessible
  const distResponse = await page.request.get('http://localhost:8080/dist.tar.gz');
  console.log('📁 dist.tar.gz accessible:', distResponse.ok());
  
  // Vérifier qu'aucune mention de CDN/NPM fictif n'existe
  const pageContent = await page.locator('.ontowave-content').textContent();
  const hasNoFakeCDN = !pageContent.includes('cdn.jsdelivr') && 
                       !pageContent.includes('npm install ontowave') &&
                       !pageContent.includes('unpkg.com');
  
  console.log('✅ Pas de CDN/NPM fictifs:', hasNoFakeCDN);
  
  // Capture finale
  await page.screenshot({ 
    path: 'tests/artifacts/corrected-downloads-and-examples.png',
    fullPage: true 
  });
  
  expect(htmlExampleBlock).toBeTruthy();
  expect(minJsResponse.ok()).toBe(true);
  expect(distResponse.ok()).toBe(true);
  expect(hasNoFakeCDN).toBe(true);
});
