import { test, expect } from '@playwright/test';

test.describe('Test Minimal NPM', () => {
    test('doit charger OntoWave v1.0.1 depuis unpkg.com', async ({ page }) => {
        await page.goto('http://localhost:8090/test-npm-minimal.html');
        
        // Attendre quelques secondes pour le chargement automatique
        await page.waitForTimeout(3000);
        
        // Vérifier que OntoWave est chargé (window.OntoWave existe)
        const hasOntoWave = await page.evaluate(() => typeof window.OntoWave !== 'undefined');
        expect(hasOntoWave).toBe(true);
        
        // Vérifier si du contenu a été automatiquement chargé
        const contentHTML = await page.locator('#content').innerHTML();
        console.log('✅ OntoWave chargé depuis unpkg.com');
        console.log('📄 Contenu automatique:', contentHTML.length > 0 ? `${contentHTML.length} caractères` : 'Aucun');
    });
});
