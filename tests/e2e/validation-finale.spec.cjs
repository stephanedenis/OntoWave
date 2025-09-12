const { test, expect } = require('@playwright/test');

test.describe('Validation finale OntoWave complet', () => {
    test('Interface multilingue + Prism + Navigation complète', async ({ page }) => {
        console.log('🚀 Test final : Interface multilingue + Prism + UX');
        
        // Aller à la page
        await page.goto('http://localhost:8000');
        
        // Attendre que OntoWave charge
        await page.waitForSelector('.ontowave-menu-option', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        console.log('✅ 1. OntoWave chargé');
        
        // 1. Vérifier l'interface multilingue OntoWave
        const menuOptionsFr = await page.locator('.ontowave-menu-option').allTextContents();
        console.log('📋 Menus français:', menuOptionsFr);
        expect(menuOptionsFr.some(text => text.includes('Accueil'))).toBe(true);
        expect(menuOptionsFr.some(text => text.includes('Configuration'))).toBe(true);
        
        // Basculer vers l'anglais
        await page.click('#btn-en');
        await page.waitForTimeout(1000);
        
        const menuOptionsEn = await page.locator('.ontowave-menu-option').allTextContents();
        console.log('📋 Menus anglais:', menuOptionsEn);
        expect(menuOptionsEn.some(text => text.includes('Home'))).toBe(true);
        expect(menuOptionsEn.some(text => text.includes('Settings'))).toBe(true);
        
        console.log('✅ 2. Interface multilingue OntoWave OK');
        
        // 2. Vérifier Prism
        const prismLoaded = await page.evaluate(() => !!window.Prism);
        expect(prismLoaded).toBe(true);
        
        const codeBlocks = await page.locator('pre code, .language-html, .language-css, .language-js').count();
        const coloredElements = await page.locator('.token').count();
        
        console.log(`🎨 Prism: ${codeBlocks} blocs, ${coloredElements} tokens colorés`);
        expect(codeBlocks).toBeGreaterThan(0);
        expect(coloredElements).toBeGreaterThan(50); // Doit avoir des tokens colorés
        
        console.log('✅ 3. Prism coloration OK');
        
        // 3. Vérifier boutons de langue (position et style)
        const langButtons = await page.locator('.lang-toggle button').count();
        expect(langButtons).toBe(2);
        
        const langTogglePosition = await page.locator('.lang-toggle').evaluate(el => {
            const style = getComputedStyle(el);
            return {
                position: style.position,
                left: style.left,
                flexDirection: style.flexDirection
            };
        });
        
        console.log('🎚️ Boutons langue:', langTogglePosition);
        expect(langTogglePosition.position).toBe('fixed');
        expect(langTogglePosition.left).toBe('20px'); // Position actuelle
        expect(langTogglePosition.flexDirection).toBe('column');
        
        console.log('✅ 4. Boutons langue positionnement OK');
        
        // 4. Vérifier contenu multilingue basique
        const contentFr = await page.locator('#lang-fr').isVisible();
        const contentEn = await page.locator('#lang-en').isVisible();
        
        // En anglais actuellement
        expect(contentEn).toBe(true);
        expect(contentFr).toBe(false);
        
        // Revenir au français
        await page.click('#btn-fr');
        await page.waitForTimeout(500);
        
        const contentFr2 = await page.locator('#lang-fr').isVisible();
        const contentEn2 = await page.locator('#lang-en').isVisible();
        
        expect(contentFr2).toBe(true);
        expect(contentEn2).toBe(false);
        
        console.log('✅ 5. Contenu multilingue basique OK');
        
        console.log('🎉 TOUS LES TESTS VALIDÉS - OntoWave complet fonctionnel !');
    });
});
