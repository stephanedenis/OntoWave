const { test, expect } = require('@playwright/test');

test('Diagnostic détaillé des problèmes', async ({ page }) => {
  console.log('🔍 DIAGNOSTIC DÉTAILLÉ DES PROBLÈMES');
  
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(5000);
  
  // 1. Vérifier le DOM final
  console.log('\n📋 1. STRUCTURE DOM:');
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('Longueur HTML:', bodyHTML.length);
  console.log('Contient lang-toggle:', bodyHTML.includes('lang-toggle'));
  console.log('Contient toggleLang:', bodyHTML.includes('toggleLang'));
  console.log('Contient script:', bodyHTML.includes('<script>'));
  
  // 2. Vérifier les éléments de langue
  console.log('\n🌐 2. ÉLÉMENTS DE LANGUE:');
  const langFr = await page.locator('#lang-fr').count();
  const langEn = await page.locator('#lang-en').count();
  const btnFr = await page.locator('#btn-fr').count();
  const btnEn = await page.locator('#btn-en').count();
  console.log('div#lang-fr:', langFr);
  console.log('div#lang-en:', langEn);
  console.log('button#btn-fr:', btnFr);
  console.log('button#btn-en:', btnEn);
  
  // 3. Vérifier les fonctions JavaScript
  console.log('\n🎯 3. FONCTIONS JAVASCRIPT:');
  const toggleLangExists = await page.evaluate(() => typeof toggleLang === 'function');
  const windowToggleLang = await page.evaluate(() => typeof window.toggleLang === 'function');
  console.log('toggleLang function:', toggleLangExists);
  console.log('window.toggleLang function:', windowToggleLang);
  
  // 4. Vérifier Prism
  console.log('\n🎨 4. PRISM:');
  const prismExists = await page.evaluate(() => typeof window.Prism === 'object');
  const prismHighlight = await page.evaluate(() => typeof window.Prism?.highlightAll === 'function');
  console.log('Prism object:', prismExists);
  console.log('Prism.highlightAll:', prismHighlight);
  
  // Vérifier les blocs de code
  const codeBlocks = await page.locator('pre code').count();
  const htmlBlocks = await page.locator('pre code.language-html').count();
  console.log('Blocs de code total:', codeBlocks);
  console.log('Blocs HTML:', htmlBlocks);
  
  if (htmlBlocks > 0) {
    const firstBlockHTML = await page.locator('pre code.language-html').first().innerHTML();
    console.log('Premier bloc HTML contains <span>:', firstBlockHTML.includes('<span>'));
    console.log('Premier bloc preview:', firstBlockHTML.substring(0, 100));
  }
  
  // 5. Vérifier OntoWave
  console.log('\n⚙️ 5. ONTOWAVE:');
  const ontoWaveExists = await page.evaluate(() => typeof window.OntoWave === 'object');
  const menuExists = await page.locator('#ontowave-floating-menu').count();
  console.log('OntoWave object:', ontoWaveExists);
  console.log('Menu flottant:', menuExists);
  
  if (menuExists > 0) {
    const menuButtons = await page.locator('#ontowave-floating-menu button').count();
    console.log('Boutons dans menu:', menuButtons);
  }
  
  // 6. Diagnostiquer le chargement du markdown
  console.log('\n📄 6. CHARGEMENT MARKDOWN:');
  const requests = [];
  page.on('request', req => requests.push(req.url()));
  await page.reload();
  await page.waitForTimeout(3000);
  
  const indexMdRequested = requests.some(url => url.includes('index.md'));
  console.log('index.md requested:', indexMdRequested);
  console.log('Requêtes:', requests.filter(url => url.includes('.md')));
  
  console.log('\n🎉 DIAGNOSTIC TERMINÉ');
});
