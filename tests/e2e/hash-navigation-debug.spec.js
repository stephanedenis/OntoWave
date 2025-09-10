// @ts-check
import { test, expect } from '@playwright/test';

test.describe('OntoWave Hash Navigation Debug', () => {
  test('Diagnose hash loss on link clicks', async ({ page }) => {
    console.log('🔍 Diagnostic du problème de perte de hash...');
    
    // Capturer les changements d'URL
    const urlChanges = [];
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        urlChanges.push(frame.url());
        console.log(`📍 Navigation vers: ${frame.url()}`);
      }
    });
    
    // Aller à la page d'accueil
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(5000); // Laisser le système de secours s'activer
    
    const initialUrl = page.url();
    console.log(`🏠 URL initiale: ${initialUrl}`);
    
    // Trouver tous les liens avec des hashs
    const hashLinks = await page.locator('a[href*="#"]').all();
    console.log(`🔗 Liens avec hash trouvés: ${hashLinks.length}`);
    
    if (hashLinks.length > 0) {
      for (let i = 0; i < Math.min(hashLinks.length, 3); i++) {
        const link = hashLinks[i];
        const href = await link.getAttribute('href');
        const linkText = await link.textContent();
        
        console.log(`\n🎯 Test du lien ${i + 1}: "${linkText?.trim()}" → ${href}`);
        
        // Vérifier si le lien est visible et cliquable
        const isVisible = await link.isVisible();
        console.log(`👁️ Lien visible: ${isVisible}`);
        
        if (isVisible) {
          const beforeClickUrl = page.url();
          console.log(`📍 URL avant clic: ${beforeClickUrl}`);
          
          try {
            await link.click();
            await page.waitForTimeout(2000);
            
            const afterClickUrl = page.url();
            console.log(`📍 URL après clic: ${afterClickUrl}`);
            
            // Analyser ce qui s'est passé
            const beforeHash = beforeClickUrl.split('#')[1] || '';
            const afterHash = afterClickUrl.split('#')[1] || '';
            const expectedHash = href?.replace(/^#/, '') || '';
            
            console.log(`🔍 Hash avant: "${beforeHash}"`);
            console.log(`🔍 Hash après: "${afterHash}"`);
            console.log(`🎯 Hash attendu: "${expectedHash}"`);
            
            if (afterHash === expectedHash) {
              console.log('✅ Navigation réussie - Hash correct');
            } else if (afterHash === '') {
              console.log('❌ PROBLÈME: Hash perdu lors du clic');
            } else {
              console.log('⚠️ Hash différent de celui attendu');
            }
            
            // Vérifier si le contenu a changé
            const content = await page.locator('#app').textContent();
            const contentChanged = content && !content.includes('Chargement') && content.length > 100;
            console.log(`📄 Contenu chargé: ${contentChanged ? 'Oui' : 'Non'} (${content?.length} chars)`);
            
          } catch (error) {
            console.log(`❌ Erreur lors du clic: ${error.message}`);
          }
        } else {
          console.log('⏭️ Lien non visible, passage au suivant');
        }
      }
    }
    
    console.log(`\n📊 Résumé des navigations: ${urlChanges.length} changements d'URL`);
    urlChanges.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
  });

  test('Test specific navigation scenarios', async ({ page }) => {
    console.log('🧪 Test de scénarios de navigation spécifiques...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(5000);
    
    // Test 1: Navigation directe via URL
    console.log('\n📍 Test 1: Navigation directe via URL');
    await page.goto('http://127.0.0.1:8080/#en/index.md');
    await page.waitForTimeout(2000);
    
    let currentUrl = page.url();
    console.log(`URL: ${currentUrl}`);
    console.log(`Hash préservé: ${currentUrl.includes('#en/index.md') ? 'Oui' : 'Non'}`);
    
    // Test 2: Navigation via JavaScript
    console.log('\n🔧 Test 2: Navigation via JavaScript');
    await page.evaluate(() => {
      location.hash = '#fr/index.md';
    });
    await page.waitForTimeout(2000);
    
    currentUrl = page.url();
    console.log(`URL: ${currentUrl}`);
    console.log(`Hash préservé: ${currentUrl.includes('#fr/index.md') ? 'Oui' : 'Non'}`);
    
    // Test 3: Clic sur lien avec inspection détaillée
    console.log('\n🔍 Test 3: Inspection détaillée des liens');
    
    // Aller à une page avec des liens
    await page.goto('http://127.0.0.1:8080/#index.md');
    await page.waitForTimeout(3000);
    
    // Examiner la structure HTML des liens
    const linkInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="#"]'));
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim(),
        onclick: link.getAttribute('onclick'),
        className: link.className,
        id: link.id
      }));
    });
    
    console.log('🔗 Analyse des liens:');
    linkInfo.forEach((link, i) => {
      console.log(`  ${i + 1}. "${link.text}" → ${link.href}`);
      if (link.onclick) console.log(`    onclick: ${link.onclick}`);
      if (link.className) console.log(`    class: ${link.className}`);
    });
  });

  test('Implement hash preservation fix', async ({ page }) => {
    console.log('🔧 Implémentation du fix de préservation des hashs...');
    
    await page.goto('http://127.0.0.1:8080/');
    await page.waitForTimeout(5000);
    
    // Injecter un fix pour préserver les hashs
    const fixResult = await page.evaluate(() => {
      // Fix pour préserver les hashs lors des clics
      const fixHashNavigation = () => {
        console.log('🔧 Installation du fix de navigation hash...');
        
        // Intercepter tous les clics sur les liens avec hash
        document.addEventListener('click', (event) => {
          const target = event.target.closest('a[href*="#"]');
          if (target) {
            event.preventDefault();
            const href = target.getAttribute('href');
            
            if (href && href.startsWith('#')) {
              console.log(`🔗 Navigation hash interceptée: ${href}`);
              
              // Changer le hash directement
              if (location.hash !== href) {
                location.hash = href;
              }
              
              // Déclencher manuellement le changement si nécessaire
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
          }
        }, true); // Capture phase pour intercepter avant autres handlers
        
        return 'Fix installé';
      };
      
      return fixHashNavigation();
    });
    
    console.log(`📋 Résultat du fix: ${fixResult}`);
    
    // Tester le fix
    await page.waitForTimeout(1000);
    
    const testLink = page.locator('a[href="#en/index.md"]').first();
    if (await testLink.count() > 0) {
      console.log('🧪 Test du fix...');
      
      const beforeUrl = page.url();
      await testLink.click();
      await page.waitForTimeout(2000);
      const afterUrl = page.url();
      
      console.log(`URL avant: ${beforeUrl}`);
      console.log(`URL après: ${afterUrl}`);
      console.log(`Fix fonctionne: ${afterUrl.includes('#en/index.md') ? 'Oui' : 'Non'}`);
    }
  });
});
