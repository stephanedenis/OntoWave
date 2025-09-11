import { test, expect } from '@playwright/test';

test.describe('Validation des corrections UI', () => {
  
  test('Boutons de langue positionnés en haut de page', async ({ page }) => {
    console.log('🧪 Test: Position des boutons de langue...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que les boutons de langue existent
    const frButton = page.locator('#btn-fr');
    const enButton = page.locator('#btn-en');
    
    await expect(frButton).toBeVisible();
    await expect(enButton).toBeVisible();
    
    // Vérifier la position (top: 20px, right: 20px)
    const langToggle = page.locator('.lang-toggle');
    const styles = await langToggle.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        right: computed.right,
        zIndex: computed.zIndex
      };
    });
    
    expect(styles.position).toBe('absolute');
    expect(styles.top).toBe('20px');
    expect(styles.right).toBe('20px');
    expect(styles.zIndex).toBe('999');
    
    console.log('✅ Boutons de langue correctement positionnés');
  });

  test('Fonctionnalité de basculement des langues', async ({ page }) => {
    console.log('🧪 Test: Basculement français/anglais...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Vérifier état initial (français par défaut pour navigateur français)
    const frContent = page.locator('#lang-fr');
    const enContent = page.locator('#lang-en');
    
    // Cliquer sur le bouton anglais
    await page.click('#btn-en');
    await page.waitForTimeout(500);
    
    // Vérifier que le contenu anglais est visible
    await expect(enContent).toBeVisible();
    
    // Vérifier que le bouton anglais est actif
    const enButtonClass = await page.locator('#btn-en').getAttribute('class');
    expect(enButtonClass).toContain('active');
    
    // Revenir au français
    await page.click('#btn-fr');
    await page.waitForTimeout(500);
    
    // Vérifier que le contenu français est visible
    await expect(frContent).toBeVisible();
    
    console.log('✅ Basculement des langues fonctionne');
  });

  test('Coloration syntaxique Prism pour les blocs HTML', async ({ page }) => {
    console.log('🧪 Test: Coloration syntaxique HTML avec Prism...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Attendre que Prism se charge
    await page.waitForFunction(() => window.Prism !== undefined, { timeout: 10000 });
    
    // Attendre un peu plus pour que la coloration s'applique
    await page.waitForTimeout(2000);
    
    // Chercher un bloc de code HTML
    const htmlCodeBlock = page.locator('code.language-html');
    await expect(htmlCodeBlock).toBeVisible();
    
    // Vérifier que le bloc contient des éléments colorés par Prism
    const highlightedElements = await htmlCodeBlock.locator('.token').count();
    expect(highlightedElements).toBeGreaterThan(0);
    
    // Vérifier des tokens spécifiques HTML
    const tagTokens = await htmlCodeBlock.locator('.token.tag').count();
    const punctuationTokens = await htmlCodeBlock.locator('.token.punctuation').count();
    
    expect(tagTokens).toBeGreaterThan(0);
    expect(punctuationTokens).toBeGreaterThan(0);
    
    console.log(`✅ Prism HTML actif: ${highlightedElements} tokens, ${tagTokens} tags, ${punctuationTokens} punctuations`);
  });

  test('Vérification des liens de licence CC', async ({ page }) => {
    console.log('🧪 Test: Image et lien de licence CC BY-NC-SA...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que l'image de licence se charge
    const licenseImage = page.locator('img[src*="licensebuttons.net"]');
    await expect(licenseImage).toBeVisible();
    
    // Vérifier que l'image pointe vers Creative Commons
    const licenseLink = page.locator('a[href*="creativecommons.org"]');
    await expect(licenseLink).toBeVisible();
    
    // Vérifier que l'image se charge sans erreur
    const imageLoaded = await licenseImage.evaluate(img => {
      return img.complete && img.naturalHeight !== 0;
    });
    expect(imageLoaded).toBe(true);
    
    console.log('✅ Licence CC BY-NC-SA fonctionnelle');
  });

  test('Exemple HTML contient le code correct', async ({ page }) => {
    console.log('🧪 Test: Code HTML de démonstration...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le code HTML d'exemple est présent et correct
    const htmlExample = page.locator('code.language-html');
    const htmlContent = await htmlExample.textContent();
    
    // Vérifications du contenu
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('<title>OntoWave</title>');
    expect(htmlContent).toContain('<script src="ontowave.min.js"></script>');
    expect(htmlContent).toContain('meta charset="UTF-8"');
    
    // Vérifier que le titre est bien simplifié (pas "OntoWave - Documentation")
    expect(htmlContent).not.toContain('OntoWave - Documentation');
    
    console.log('✅ Exemple HTML correct et simplifié');
  });

});
