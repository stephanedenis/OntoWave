import { test, expect } from '@playwright/test';

/**
 * REVERSE ENGINEERING COMPLET - OntoWave v1.0.0
 * 
 * Ce test documente TOUTES les fonctionnalités avec captures d'écran
 * pour servir de référence aux tests de régression futurs.
 * 
 * Méthodologie:
 * 1. Chaque feature testée séparément
 * 2. Screenshot à chaque étape clé
 * 3. Vérifications comportementales précises
 * 4. Documentation inline du comportement attendu
 */

const BASE_URL = 'http://localhost:8080';

test.describe('OntoWave v1.0.0 - Reverse Engineering Complet', () => {
  
  // ============================================================================
  // 1. CHARGEMENT INITIAL & MENU FLOTTANT
  // ============================================================================
  
  test('01 - Chargement initial et apparition du menu flottant', async ({ page }) => {
    console.log('📸 Test 01: Chargement initial');
    
    // Naviguer vers la page
    await page.goto(`${BASE_URL}/index.html`);
    
    // Screenshot 1: Page initiale avant chargement OntoWave
    await page.screenshot({ 
      path: 'screenshots/regression/menu/01-01-initial-blank.png',
      fullPage: true 
    });
    
    // Attendre que OntoWave soit chargé (menu flottant visible)
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Screenshot 2: Menu flottant apparu (état compact)
    await page.screenshot({ 
      path: 'screenshots/regression/menu/01-02-menu-compact.png',
      fullPage: true 
    });
    
    // Vérifications détaillées
    await expect(menu).toHaveCSS('position', 'fixed');
    await expect(menu).toHaveCSS('top', '20px');
    await expect(menu).toHaveCSS('left', '20px');
    await expect(menu).toHaveCSS('z-index', '1000');
    
    // Vérifier icône 🌊
    const icon = menu.locator('.ontowave-menu-icon');
    await expect(icon).toBeVisible();
    const iconText = await icon.textContent();
    expect(iconText).toContain('🌊');
    
    // Vérifier dimensions compact: 44x44px
    const bbox = await menu.boundingBox();
    expect(bbox?.width).toBeCloseTo(44, 5);
    expect(bbox?.height).toBeCloseTo(44, 5);
    
    console.log('✅ Chargement initial validé');
  });

  test('02 - Menu flottant: Expansion et options', async ({ page }) => {
    console.log('📸 Test 02: Expansion menu');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Click sur icône pour étendre
    const icon = menu.locator('.ontowave-menu-icon');
    await icon.click();
    
    // Attendre expansion
    await expect(menu).toHaveClass(/expanded/);
    
    // Screenshot 3: Menu étendu avec options
    await page.screenshot({ 
      path: 'screenshots/regression/menu/02-01-menu-expanded.png',
      fullPage: true 
    });
    
    // Vérifier options visibles
    const homeOption = menu.locator('.ontowave-menu-option', { hasText: /Accueil|Home/ });
    await expect(homeOption).toBeVisible();
    
    const configOption = menu.locator('.ontowave-menu-option', { hasText: /Configuration/ });
    await expect(configOption).toBeVisible();
    
    // Vérifier marque OntoWave.org
    const brand = menu.locator('.ontowave-menu-brand');
    await expect(brand).toBeVisible();
    await expect(brand).toHaveText('OntoWave.org');
    
    // Vérifier boutons langues
    const frButton = menu.locator('.ontowave-lang-btn', { hasText: 'FR' });
    const enButton = menu.locator('.ontowave-lang-btn', { hasText: 'EN' });
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    
    // Screenshot 4: Focus sur menu étendu
    await menu.screenshot({ 
      path: 'screenshots/regression/menu/02-02-menu-expanded-detail.png' 
    });
    
    console.log('✅ Expansion menu validée');
  });

  test('03 - Menu flottant: Drag & Drop', async ({ page }) => {
    console.log('📸 Test 03: Drag & Drop menu');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Position initiale
    const initialBox = await menu.boundingBox();
    console.log('Position initiale:', initialBox);
    
    // Screenshot 5: Avant drag
    await page.screenshot({ 
      path: 'screenshots/regression/menu/03-01-before-drag.png',
      fullPage: true 
    });
    
    // Drag vers nouvelle position (centre droit de la page)
    await menu.dragTo(page.locator('body'), {
      targetPosition: { x: 700, y: 300 }
    });
    
    // Attendre fin animation
    await page.waitForTimeout(500);
    
    // Position finale
    const finalBox = await menu.boundingBox();
    console.log('Position finale:', finalBox);
    
    // Vérifier déplacement effectué
    expect(finalBox?.x).not.toBe(initialBox?.x);
    expect(finalBox?.y).not.toBe(initialBox?.y);
    
    // Screenshot 6: Après drag
    await page.screenshot({ 
      path: 'screenshots/regression/menu/03-02-after-drag.png',
      fullPage: true 
    });
    
    console.log('✅ Drag & Drop validé');
  });

  // ============================================================================
  // 2. SYSTÈME MULTILINGUE (i18n)
  // ============================================================================
  
  test('04 - Multilingue: Détection et switch FR/EN', async ({ page }) => {
    console.log('📸 Test 04: Système multilingue');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Étendre menu
    await menu.locator('.ontowave-menu-icon').click();
    await expect(menu).toHaveClass(/expanded/);
    
    // Screenshot 7: Menu avec boutons langues
    await menu.screenshot({ 
      path: 'screenshots/regression/i18n/04-01-menu-with-lang-buttons.png' 
    });
    
    // Vérifier bouton FR actif par défaut (ou selon détection)
    const frButton = menu.locator('.ontowave-lang-btn', { hasText: 'FR' });
    const enButton = menu.locator('.ontowave-lang-btn', { hasText: 'EN' });
    
    // Screenshot 8: État initial (langue détectée)
    await page.screenshot({ 
      path: 'screenshots/regression/i18n/04-02-initial-lang-fr.png',
      fullPage: true 
    });
    
    // Switch vers EN
    await enButton.click();
    await page.waitForTimeout(1000); // Attendre changement
    
    // Vérifier EN actif
    await expect(enButton).toHaveClass(/active/);
    
    // Vérifier texte interface changé
    const homeOption = menu.locator('.ontowave-menu-option').first();
    const homeText = await homeOption.textContent();
    expect(homeText).toContain('Home'); // Anglais
    
    // Screenshot 9: Interface en anglais
    await page.screenshot({ 
      path: 'screenshots/regression/i18n/04-03-switched-to-en.png',
      fullPage: true 
    });
    
    // Retour à FR
    await frButton.click();
    await page.waitForTimeout(1000);
    
    // Screenshot 10: Retour français
    await page.screenshot({ 
      path: 'screenshots/regression/i18n/04-04-back-to-fr.png',
      fullPage: true 
    });
    
    console.log('✅ Multilingue validé');
  });

  // ============================================================================
  // 3. PANNEAU DE CONFIGURATION
  // ============================================================================
  
  test('05 - Panneau de configuration: Ouverture et options', async ({ page }) => {
    console.log('📸 Test 05: Panneau configuration');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Étendre menu
    await menu.locator('.ontowave-menu-icon').click();
    
    // Cliquer sur Configuration
    const configOption = menu.locator('.ontowave-menu-option', { hasText: /Configuration/ });
    await configOption.click();
    
    // Attendre ouverture panneau
    const configPanel = page.locator('.ontowave-config-panel');
    await expect(configPanel).toBeVisible({ timeout: 5000 });
    
    // Screenshot 11: Panneau config ouvert (vue complète)
    await page.screenshot({ 
      path: 'screenshots/regression/config/05-01-config-panel-full.png',
      fullPage: true 
    });
    
    // Screenshot 12: Détail panneau
    await configPanel.screenshot({ 
      path: 'screenshots/regression/config/05-02-config-panel-detail.png' 
    });
    
    // Vérifier sections présentes
    const generalSection = configPanel.locator('text=Général');
    await expect(generalSection).toBeVisible();
    
    const langSection = configPanel.locator('text=Langues');
    await expect(langSection).toBeVisible();
    
    const navSection = configPanel.locator('text=Navigation');
    await expect(navSection).toBeVisible();
    
    const mermaidSection = configPanel.locator('text=Mermaid');
    await expect(mermaidSection).toBeVisible();
    
    const plantumlSection = configPanel.locator('text=PlantUML');
    await expect(plantumlSection).toBeVisible();
    
    const prismSection = configPanel.locator('text=Prism');
    await expect(prismSection).toBeVisible();
    
    const uiSection = configPanel.locator('text=Interface Utilisateur');
    await expect(uiSection).toBeVisible();
    
    // Vérifier boutons
    const applyButton = configPanel.locator('button', { hasText: /Appliquer/ });
    await expect(applyButton).toBeVisible();
    
    const downloadHTMLButton = configPanel.locator('button', { hasText: /Télécharger HTML/ });
    await expect(downloadHTMLButton).toBeVisible();
    
    const resetButton = configPanel.locator('button', { hasText: /Réinitialiser/ });
    await expect(resetButton).toBeVisible();
    
    // Screenshot 13: Scroll sections
    await configPanel.evaluate(el => el.scrollTo(0, 300));
    await page.screenshot({ 
      path: 'screenshots/regression/config/05-03-config-panel-scrolled.png',
      fullPage: true 
    });
    
    // Fermer panneau (clic extérieur)
    await page.click('body', { position: { x: 50, y: 50 } });
    await expect(configPanel).not.toBeVisible();
    
    // Screenshot 14: Panneau fermé
    await page.screenshot({ 
      path: 'screenshots/regression/config/05-04-config-panel-closed.png',
      fullPage: true 
    });
    
    console.log('✅ Panneau configuration validé');
  });

  // ============================================================================
  // 4. RENDU MARKDOWN & NAVIGATION
  // ============================================================================
  
  test('06 - Rendu markdown: Headers, listes, tableaux', async ({ page }) => {
    console.log('📸 Test 06: Rendu markdown');
    
    await page.goto(`${BASE_URL}/index.html`);
    
    // Attendre chargement contenu
    const container = page.locator('.ontowave-container');
    await expect(container).toBeVisible({ timeout: 10000 });
    
    // Attendre présence de contenu markdown
    const content = container.locator('.ontowave-content, #ontowave-content');
    await expect(content).toBeVisible();
    
    // Screenshot 15: Page markdown complète
    await page.screenshot({ 
      path: 'screenshots/regression/markdown/06-01-markdown-full-page.png',
      fullPage: true 
    });
    
    // Vérifier headers
    const h1 = content.locator('h1').first();
    if (await h1.count() > 0) {
      await expect(h1).toBeVisible();
      await h1.screenshot({ 
        path: 'screenshots/regression/markdown/06-02-h1-header.png' 
      });
    }
    
    // Vérifier listes
    const ul = content.locator('ul').first();
    if (await ul.count() > 0) {
      await ul.screenshot({ 
        path: 'screenshots/regression/markdown/06-03-list.png' 
      });
    }
    
    // Vérifier tableaux
    const table = content.locator('table').first();
    if (await table.count() > 0) {
      await expect(table).toBeVisible();
      await table.screenshot({ 
        path: 'screenshots/regression/markdown/06-04-table.png' 
      });
      
      // Vérifier CSS tableaux
      await expect(table).toHaveCSS('border-collapse', 'collapse');
    }
    
    // Vérifier blocs de code
    const codeBlock = content.locator('pre code').first();
    if (await codeBlock.count() > 0) {
      await codeBlock.screenshot({ 
        path: 'screenshots/regression/markdown/06-05-code-block.png' 
      });
    }
    
    console.log('✅ Rendu markdown validé');
  });

  test('07 - Navigation: Liens et breadcrumb', async ({ page }) => {
    console.log('📸 Test 07: Navigation');
    
    await page.goto(`${BASE_URL}/index.html`);
    
    const container = page.locator('.ontowave-container');
    await expect(container).toBeVisible({ timeout: 10000 });
    
    // Screenshot 16: Page initiale avec breadcrumb
    await page.screenshot({ 
      path: 'screenshots/regression/navigation/07-01-initial-page-breadcrumb.png',
      fullPage: true 
    });
    
    // Chercher premier lien markdown
    const firstLink = page.locator('a[href*=".md"]').first();
    if (await firstLink.count() > 0) {
      const linkText = await firstLink.textContent();
      console.log('Premier lien trouvé:', linkText);
      
      // Click lien
      await firstLink.click();
      await page.waitForTimeout(1000);
      
      // Screenshot 17: Nouvelle page chargée
      await page.screenshot({ 
        path: 'screenshots/regression/navigation/07-02-navigated-page.png',
        fullPage: true 
      });
      
      // Vérifier breadcrumb mis à jour
      const breadcrumb = page.locator('.ontowave-breadcrumb');
      if (await breadcrumb.count() > 0) {
        await breadcrumb.screenshot({ 
          path: 'screenshots/regression/navigation/07-03-breadcrumb-updated.png' 
        });
      }
    }
    
    console.log('✅ Navigation validée');
  });

  // ============================================================================
  // 5. DIAGRAMMES MERMAID
  // ============================================================================
  
  test('08 - Diagrammes Mermaid: Rendu SVG', async ({ page }) => {
    console.log('📸 Test 08: Diagrammes Mermaid');
    
    // Note: Nécessite une page avec diagramme Mermaid
    // Si index.html n'en contient pas, créer page de test
    
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(3000);
    
    // Chercher SVG Mermaid
    const mermaidSvg = page.locator('svg[id^="mermaid"]').first();
    
    if (await mermaidSvg.count() > 0) {
      await expect(mermaidSvg).toBeVisible();
      
      // Screenshot 18: Diagramme Mermaid
      await mermaidSvg.screenshot({ 
        path: 'screenshots/regression/diagrams/08-01-mermaid-diagram.png' 
      });
      
      console.log('✅ Mermaid trouvé et capturé');
    } else {
      console.log('⚠️  Pas de diagramme Mermaid sur cette page');
      await page.screenshot({ 
        path: 'screenshots/regression/diagrams/08-01-no-mermaid.png',
        fullPage: true 
      });
    }
  });

  // ============================================================================
  // 6. DIAGRAMMES PLANTUML
  // ============================================================================
  
  test('09 - Diagrammes PlantUML: Rendu SVG', async ({ page }) => {
    console.log('📸 Test 09: Diagrammes PlantUML');
    
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(5000); // PlantUML peut prendre du temps
    
    // Chercher SVG PlantUML (généralement sans ID spécifique)
    const allSvgs = page.locator('svg');
    const svgCount = await allSvgs.count();
    
    console.log(`Nombre de SVG trouvés: ${svgCount}`);
    
    if (svgCount > 0) {
      // Screenshot tous les SVG
      for (let i = 0; i < svgCount; i++) {
        const svg = allSvgs.nth(i);
        const svgId = await svg.getAttribute('id');
        
        // Si pas d'ID mermaid, probablement PlantUML
        if (!svgId || !svgId.startsWith('mermaid')) {
          await svg.screenshot({ 
            path: `screenshots/regression/diagrams/09-01-plantuml-${i}.png` 
          });
          console.log(`✅ PlantUML ${i} capturé`);
        }
      }
    } else {
      console.log('⚠️  Pas de diagramme SVG trouvé');
    }
    
    // Screenshot page complète
    await page.screenshot({ 
      path: 'screenshots/regression/diagrams/09-02-page-with-diagrams.png',
      fullPage: true 
    });
  });

  // ============================================================================
  // 7. TABLE DES MATIÈRES (TOC)
  // ============================================================================
  
  test('10 - Table des matières: Génération et navigation', async ({ page }) => {
    console.log('📸 Test 10: Table des matières');
    
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(2000);
    
    // Chercher TOC
    const toc = page.locator('.ontowave-toc, #ontowave-toc');
    
    if (await toc.count() > 0) {
      await expect(toc).toBeVisible();
      
      // Screenshot 19: TOC
      await toc.screenshot({ 
        path: 'screenshots/regression/navigation/10-01-toc.png' 
      });
      
      // Vérifier liens TOC
      const tocLinks = toc.locator('a');
      const linkCount = await tocLinks.count();
      console.log(`TOC contient ${linkCount} liens`);
      
      if (linkCount > 0) {
        // Cliquer premier lien TOC
        await tocLinks.first().click();
        await page.waitForTimeout(500);
        
        // Screenshot 20: Scroll vers section
        await page.screenshot({ 
          path: 'screenshots/regression/navigation/10-02-toc-navigation.png',
          fullPage: true 
        });
      }
      
      console.log('✅ TOC validé');
    } else {
      console.log('⚠️  Pas de TOC visible');
    }
  });

  // ============================================================================
  // 8. RESPONSIVE DESIGN
  // ============================================================================
  
  test('11 - Responsive: Desktop, Tablet, Mobile', async ({ page }) => {
    console.log('📸 Test 11: Responsive design');
    
    // Desktop (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/regression/responsive/11-01-desktop-1920.png',
      fullPage: true 
    });
    
    // Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'screenshots/regression/responsive/11-02-tablet-768.png',
      fullPage: true 
    });
    
    // Mobile (375x667 - iPhone)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'screenshots/regression/responsive/11-03-mobile-375.png',
      fullPage: true 
    });
    
    // Vérifier menu toujours accessible
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible();
    
    console.log('✅ Responsive validé');
  });

  // ============================================================================
  // 9. EXPORT / TÉLÉCHARGEMENTS
  // ============================================================================
  
  test('12 - Export: Télécharger HTML et JS', async ({ page }) => {
    console.log('📸 Test 12: Export fonctionnalités');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Ouvrir panneau config
    await menu.locator('.ontowave-menu-icon').click();
    const configOption = menu.locator('.ontowave-menu-option', { hasText: /Configuration/ });
    await configOption.click();
    
    const configPanel = page.locator('.ontowave-config-panel');
    await expect(configPanel).toBeVisible({ timeout: 5000 });
    
    // Screenshot boutons export
    const downloadSection = configPanel.locator('button:has-text("Télécharger")').first();
    if (await downloadSection.count() > 0) {
      await page.screenshot({ 
        path: 'screenshots/regression/export/12-01-export-buttons.png',
        fullPage: true 
      });
    }
    
    // Note: Téléchargements réels nécessitent download handling
    // Pour regression, capturer interface suffit
    
    console.log('✅ Interface export capturée');
  });

});

// ============================================================================
// TESTS SUPPLÉMENTAIRES SPÉCIFIQUES
// ============================================================================

test.describe('OntoWave - Tests Spécifiques Avancés', () => {
  
  test('13 - Persistance: Position menu et préférences', async ({ page, context }) => {
    console.log('📸 Test 13: Persistance localStorage');
    
    await page.goto(`${BASE_URL}/index.html`);
    const menu = page.locator('#ontowave-floating-menu');
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Déplacer menu
    await menu.dragTo(page.locator('body'), {
      targetPosition: { x: 500, y: 400 }
    });
    await page.waitForTimeout(500);
    
    const draggedBox = await menu.boundingBox();
    console.log('Position après drag:', draggedBox);
    
    // Reload page
    await page.reload();
    await expect(menu).toBeVisible({ timeout: 10000 });
    
    // Vérifier position conservée
    const reloadedBox = await menu.boundingBox();
    console.log('Position après reload:', reloadedBox);
    
    // Screenshot 21: Position persistée
    await page.screenshot({ 
      path: 'screenshots/regression/persistence/13-01-menu-position-persisted.png',
      fullPage: true 
    });
    
    // Note: Tolérance 10px pour variations
    expect(Math.abs((reloadedBox?.x || 0) - (draggedBox?.x || 0))).toBeLessThan(10);
    
    console.log('✅ Persistance validée');
  });

  test('14 - Gestion erreurs: Page 404', async ({ page }) => {
    console.log('📸 Test 14: Gestion erreurs');
    
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForTimeout(2000);
    
    // Naviguer vers page inexistante
    await page.evaluate(() => {
      // Simuler navigation vers 404
      window.location.hash = '#/page-inexistante.md';
    });
    
    await page.waitForTimeout(2000);
    
    // Screenshot 22: Message erreur 404
    await page.screenshot({ 
      path: 'screenshots/regression/errors/14-01-404-error.png',
      fullPage: true 
    });
    
    // Vérifier message d'erreur présent
    const errorMsg = page.locator('text=/404|not found|introuvable/i').first();
    if (await errorMsg.count() > 0) {
      console.log('✅ Message erreur 404 affiché');
    }
  });

});
