const { test, expect } = require('@playwright/test');

test.describe('Interface multilingue OntoWave', () => {
    test('Les menus OntoWave changent selon la langue sélectionnée', async ({ page }) => {
        // Aller à la page
        await page.goto('http://localhost:8000');
        
        // Attendre que OntoWave charge
        await page.waitForSelector('.ontowave-menu-option', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        console.log('🌐 Test de l\'interface multilingue OntoWave');
        
        // Vérifier état initial (français par défaut)
        const menuOptionsFr = await page.locator('.ontowave-menu-option').allTextContents();
        console.log('📋 Menus en français:', menuOptionsFr);
        
        // Vérifier qu'on a bien "Accueil" et "Configuration" en français
        expect(menuOptionsFr.some(text => text.includes('Accueil'))).toBe(true);
        expect(menuOptionsFr.some(text => text.includes('Configuration'))).toBe(true);
        
        // Basculer vers l'anglais
        await page.click('#btn-en');
        await page.waitForTimeout(1000); // Attendre la mise à jour
        
        // Vérifier que les menus ont changé
        const menuOptionsEn = await page.locator('.ontowave-menu-option').allTextContents();
        console.log('📋 Menus en anglais:', menuOptionsEn);
        
        // Vérifier qu'on a bien "Home" et "Settings" en anglais
        expect(menuOptionsEn.some(text => text.includes('Home'))).toBe(true);
        expect(menuOptionsEn.some(text => text.includes('Settings'))).toBe(true);
        
        // Revenir au français
        await page.click('#btn-fr');
        await page.waitForTimeout(1000);
        
        // Vérifier que c'est bien revenu en français
        const menuOptionsFr2 = await page.locator('.ontowave-menu-option').allTextContents();
        console.log('📋 Menus retour français:', menuOptionsFr2);
        
        expect(menuOptionsFr2.some(text => text.includes('Accueil'))).toBe(true);
        expect(menuOptionsFr2.some(text => text.includes('Configuration'))).toBe(true);
        
        console.log('✅ Interface multilingue OntoWave fonctionne !');
    });
});
