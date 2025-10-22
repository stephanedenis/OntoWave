import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Démo 12: Code vs Rendu - Debug Prism', () => {
  test('capture écran et analyse console', async ({ page }) => {
    const screenshotsDir = path.join(__dirname, '../../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Capturer tous les messages console
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });
      console.log(`[${msg.type()}] ${text}`);
    });

    // Capturer les erreurs
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('❌ Page Error:', error.message);
    });

    // Naviguer vers la démo
    console.log('📄 Chargement de la page...');
    await page.goto('http://localhost:8080/demos/12-code-vs-render.html', {
      waitUntil: 'networkidle'
    });

    // Attendre le chargement complet
    await page.waitForTimeout(3000);

    // Capture 1: Page initiale (sections pliées)
    console.log('📸 Capture 1: Page initiale');
    await page.screenshot({
      path: path.join(screenshotsDir, 'demo12-01-initial.png'),
      fullPage: true
    });

    // Vérifier les sections <details>
    const detailsElements = await page.locator('details').all();
    console.log(`\n🔍 Nombre de <details> trouvés: ${detailsElements.length}`);

    for (let i = 0; i < detailsElements.length; i++) {
      const details = detailsElements[i];
      const summary = await details.locator('summary').textContent({ timeout: 10000 });
      const isOpen = await details.evaluate(el => el.hasAttribute('open'));
      
      console.log(`\n📋 Details #${i + 1}: "${summary}"`);
      console.log(`   État: ${isOpen ? '🔓 Ouvert' : '🔒 Fermé'}`);

      // Vérifier si le code est visible
      const codeBlock = details.locator('pre code');
      const codeCount = await codeBlock.count();
      
      if (codeCount > 0) {
        const codeClass = await codeBlock.getAttribute('class');
        const codeVisible = await codeBlock.isVisible();
        const codeText = await codeBlock.textContent();
        
        console.log(`   Code: class="${codeClass}"`);
        console.log(`   Visible: ${codeVisible}`);
        console.log(`   Longueur: ${codeText.length} caractères`);
        
        // Vérifier si Prism a appliqué la coloration
        const hasTokens = await codeBlock.locator('.token').count();
        console.log(`   Tokens Prism: ${hasTokens} éléments`);
        
        if (!isOpen && hasTokens === 0) {
          console.log(`   ⚠️  CODE NON COLORÉ (details fermé)`);
        }
      }

      // Ouvrir le <details> pour voir le code
      if (!isOpen) {
        console.log(`   🔓 Ouverture du <details>...`);
        await details.click();
        await page.waitForTimeout(500);

        // Capture après ouverture
        await page.screenshot({
          path: path.join(screenshotsDir, `demo12-02-details-${i + 1}-open.png`),
          fullPage: true
        });

        // Re-vérifier après ouverture
        const tokensAfter = await codeBlock.locator('.token').count();
        console.log(`   Tokens après ouverture: ${tokensAfter} éléments`);
        
        if (tokensAfter === 0) {
          console.log(`   ❌ PROBLÈME: Code toujours pas coloré après ouverture!`);
        } else {
          console.log(`   ✅ Code coloré après ouverture`);
        }
      }
    }

    // Vérifier les diagrammes rendus
    console.log('\n\n🎨 Vérification diagrammes rendus:');
    
    const mermaidDiagrams = await page.locator('.mermaid').count();
    console.log(`   Mermaid: ${mermaidDiagrams} diagrammes`);
    
    const plantumlImages = await page.locator('img[alt*="PlantUML"]').count();
    console.log(`   PlantUML: ${plantumlImages} images`);

    // Capture finale avec tout ouvert
    console.log('\n📸 Capture finale: Tout déplié');
    await page.screenshot({
      path: path.join(screenshotsDir, 'demo12-03-final-all-open.png'),
      fullPage: true
    });

    // Analyser les messages console
    console.log('\n\n📊 ANALYSE CONSOLE:');
    console.log('═══════════════════════════════════════════════════');
    
    const prismMessages = consoleMessages.filter(m => 
      m.text.includes('Prism') || m.text.includes('prism')
    );
    console.log(`\n🎨 Messages Prism (${prismMessages.length}):`);
    prismMessages.forEach(m => {
      console.log(`   [${m.type}] ${m.text}`);
    });

    const mermaidMessages = consoleMessages.filter(m => 
      m.text.includes('Mermaid') || m.text.includes('mermaid')
    );
    console.log(`\n🌊 Messages Mermaid (${mermaidMessages.length}):`);
    mermaidMessages.forEach(m => {
      console.log(`   [${m.type}] ${m.text}`);
    });

    const plantumlMessages = consoleMessages.filter(m => 
      m.text.includes('PlantUML') || m.text.includes('plantuml')
    );
    console.log(`\n🏭 Messages PlantUML (${plantumlMessages.length}):`);
    plantumlMessages.forEach(m => {
      console.log(`   [${m.type}] ${m.text}`);
    });

    const errorMessages = consoleMessages.filter(m => 
      m.type === 'error' || m.type === 'warning'
    );
    console.log(`\n⚠️  Erreurs/Warnings (${errorMessages.length}):`);
    errorMessages.forEach(m => {
      console.log(`   [${m.type}] ${m.text}`);
    });

    // Rapport final
    console.log('\n\n📝 RÉSUMÉ:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Sections <details>: ${detailsElements.length}`);
    console.log(`✅ Diagrammes Mermaid: ${mermaidDiagrams}`);
    console.log(`✅ Images PlantUML: ${plantumlImages}`);
    console.log(`⚠️  Erreurs JS: ${errors.length}`);
    console.log(`📸 Screenshots: ${screenshotsDir}`);

    // Assertions
    expect(detailsElements.length).toBeGreaterThan(0);
    expect(errors.length).toBe(0);
  });
});
