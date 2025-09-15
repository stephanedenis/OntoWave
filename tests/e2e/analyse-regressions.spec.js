import { test, expect } from '@playwright/test';

test('Capture état actuel vs référence visuelle', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement complet
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Capture de l'état actuel
  await page.screenshot({ 
    path: 'captures/etat-actuel-homepage.png', 
    fullPage: true 
  });
  
  // Vérifier l'existence du menu OntoWave
  const ontoWaveButton = page.locator('.ontowave-container button').first();
  if (await ontoWaveButton.isVisible()) {
    console.log('✅ Menu OntoWave visible');
    
    // Ouvrir le menu OntoWave
    await ontoWaveButton.click();
    await page.waitForTimeout(1000);
    
    // Capture du menu ouvert
    await page.screenshot({ 
      path: 'captures/etat-actuel-menu-ouvert.png', 
      fullPage: true 
    });
    
    // Vérifier le panneau de configuration
    const configButton = page.locator('text=Configuration').first();
    if (await configButton.isVisible()) {
      await configButton.click();
      await page.waitForTimeout(2000);
      
      // Capture du panneau de configuration
      await page.screenshot({ 
        path: 'captures/etat-actuel-config-panel.png', 
        fullPage: true 
      });
    }
  } else {
    console.log('❌ Menu OntoWave non visible');
  }
  
  // Test des boutons de langue
  const langButtons = page.locator('.lang-toggle, button:has-text("FR"), button:has-text("EN")');
  const langCount = await langButtons.count();
  console.log(`🌐 Boutons de langue trouvés: ${langCount}`);
  
  if (langCount > 0) {
    await page.screenshot({ 
      path: 'captures/etat-actuel-lang-buttons.png'
    });
  }
  
  // Analyser le contenu markdown
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('📝 Titres trouvés:', headings);
  
  // Vérifier les blocs de code
  const codeBlocks = await page.locator('pre code').count();
  console.log(`💻 Blocs de code: ${codeBlocks}`);
  
  // Vérifier les diagrammes
  const diagrams = await page.locator('img[src*="plantuml"], svg[id*="mermaid"]').count();
  console.log(`📊 Diagrammes: ${diagrams}`);
  
  // Analyser les erreurs console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  console.log('🚨 Erreurs console:', errors);
});

test('Comparaison avec version de référence minimal.html', async ({ page }) => {
  // Tester la version minimale de référence
  await page.goto('http://localhost:8080/demo/minimal.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Capture de la référence
  await page.screenshot({ 
    path: 'captures/reference-minimal.png', 
    fullPage: true 
  });
  
  // Analyser la référence
  const refOntoWave = page.locator('.ontowave-container button').first();
  const refVisible = await refOntoWave.isVisible();
  console.log(`📋 Référence - OntoWave visible: ${refVisible}`);
  
  if (refVisible) {
    await refOntoWave.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'captures/reference-minimal-menu.png', 
      fullPage: true 
    });
  }
  
  // Comparer les contenus
  const refHeadings = await page.locator('h1, h2, h3').allTextContents();
  console.log('📋 Référence - Titres:', refHeadings);
});

test('Analyse détaillée des régressions', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Éléments qui devraient être présents
  const elements = {
    'Titre principal': 'h1:has-text("OntoWave")',
    'Section utilisation': 'h3:has-text("Utilisation")',
    'Bloc code HTML': 'pre code.language-html',
    'Menu OntoWave': '.ontowave-container',
    'Boutons langue': '.lang-toggle, button:has-text("FR"), button:has-text("EN")',
    'Section licence': 'h3:has-text("Licence")',
    'Diagramme architecture': 'img[src*="plantuml"]'
  };
  
  console.log('🔍 ANALYSE DES RÉGRESSIONS:');
  console.log('===========================');
  
  for (const [nom, selecteur] of Object.entries(elements)) {
    try {
      const element = page.locator(selecteur);
      const count = await element.count();
      const visible = count > 0 ? await element.first().isVisible() : false;
      
      console.log(`${visible ? '✅' : '❌'} ${nom}: ${count} trouvé(s), visible: ${visible}`);
      
      if (count > 0 && !visible) {
        console.log(`   ⚠️  Élément présent mais non visible: ${selecteur}`);
      }
    } catch (error) {
      console.log(`❌ ${nom}: Erreur - ${error.message}`);
    }
  }
  
  // Analyser la structure DOM
  const bodyHTML = await page.locator('body').innerHTML();
  
  // Rechercher des problèmes spécifiques
  const problemes = [];
  
  if (!bodyHTML.includes('ontowave.min.js')) {
    problemes.push('Script OntoWave non trouvé');
  }
  
  if (!bodyHTML.includes('class="ontowave-container"')) {
    problemes.push('Container OntoWave non créé');
  }
  
  if (bodyHTML.includes('Error') || bodyHTML.includes('error')) {
    problemes.push('Messages d\'erreur détectés');
  }
  
  console.log('🚨 PROBLÈMES DÉTECTÉS:');
  problemes.forEach(p => console.log(`   - ${p}`));
  
  // Capture finale avec annotations
  await page.screenshot({ 
    path: 'captures/analyse-complete.png', 
    fullPage: true 
  });
});
