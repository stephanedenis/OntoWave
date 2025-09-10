import { test, expect } from '@playwright/test';

test('Debug contenu des blocs de code', async ({ page }) => {
  console.log('🔍 Debug: Contenu exact des blocs de code');
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(4000);
  await page.waitForSelector('.ontowave-content', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Analyser chaque bloc de code individuellement
  const codeContents = await page.$$eval('code', elements => 
    elements.map((el, index) => ({
      index: index,
      text: el.textContent || '',
      html: el.innerHTML || '',
      classes: el.className || '',
      parent: el.parentElement?.tagName || ''
    }))
  );
  
  console.log('📋 Analyse détaillée des blocs de code:');
  codeContents.forEach((block, i) => {
    console.log(`  ${i+1}. [${block.parent}] Classes: "${block.classes}"`);
    console.log(`      Texte (50 chars): "${block.text.substring(0, 50)}..."`);
    console.log(`      HTML (50 chars): "${block.html.substring(0, 50)}..."`);
    
    if (block.text.includes('DOCTYPE')) {
      console.log(`      ✅ CONTIENT DOCTYPE!`);
    }
    if (block.text.includes('ontowave')) {
      console.log(`      ✅ CONTIENT ontowave!`);
    }
    console.log('');
  });
  
  // Vérifier le HTML brut de la page
  const pageHTML = await page.content();
  const hasHTMLInSource = pageHTML.includes('<!DOCTYPE html>') && pageHTML.includes('ontowave');
  console.log(`🌐 HTML brut contient DOCTYPE + ontowave: ${hasHTMLInSource}`);
  
  // Vérifier spécifiquement les éléments .ontowave-code
  const ontowaveCodeContents = await page.$$eval('.ontowave-code code', elements => 
    elements.map(el => el.textContent || '')
  );
  
  console.log('🌊 Contenu des .ontowave-code:');
  ontowaveCodeContents.forEach((content, i) => {
    console.log(`  ${i+1}. "${content.substring(0, 100)}..."`);
  });
  
  expect(codeContents.length).toBeGreaterThan(0);
});
