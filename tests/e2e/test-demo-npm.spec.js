import { test, expect } from '@playwright/test';

test.describe('Demo NPM OntoWave v1.0.1', () => {
    test('doit charger OntoWave depuis unpkg.com et afficher les tableaux', async ({ page }) => {
        // Naviguer vers la page de démo
        await page.goto('http://localhost:8090/demo-npm.html');
        
        // Attendre que le loading disparaisse
        await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 });
        
        // Vérifier que le contenu est affiché
        const content = await page.locator('#content');
        await expect(content).toBeVisible();
        
        // Vérifier que les tableaux sont rendus
        const tables = await page.locator('table').count();
        expect(tables).toBeGreaterThan(0);
        console.log(`✅ ${tables} tableaux trouvés`);
        
        // Vérifier les alignements
        const leftAligned = await page.locator('.text-left').count();
        const centerAligned = await page.locator('.text-center').count();
        const rightAligned = await page.locator('.text-right').count();
        
        console.log(`📊 Alignements détectés:`);
        console.log(`   Gauche: ${leftAligned}`);
        console.log(`   Centre: ${centerAligned}`);
        console.log(`   Droite: ${rightAligned}`);
        
        expect(centerAligned).toBeGreaterThan(0);
        expect(rightAligned).toBeGreaterThan(0);
        
        // Vérifier que le script OntoWave est chargé depuis unpkg
        const scripts = await page.evaluate(() => {
            return Array.from(document.scripts).map(s => s.src);
        });
        
        const unpkgScript = scripts.find(src => src.includes('unpkg.com/ontowave'));
        expect(unpkgScript).toBeTruthy();
        console.log(`✅ OntoWave chargé depuis: ${unpkgScript}`);
        
        // Capturer une screenshot
        await page.screenshot({ 
            path: 'DEMO-NPM-ONTOWAVE.png', 
            fullPage: true 
        });
        
        console.log('✅ Screenshot capturée: DEMO-NPM-ONTOWAVE.png');
    });
    
    test('doit afficher les styles CSS des tableaux', async ({ page }) => {
        await page.goto('http://localhost:8090/demo-npm.html');
        await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 });
        
        // Vérifier qu'un tableau existe
        const table = page.locator('table').first();
        await expect(table).toBeVisible();
        
        // Vérifier les styles CSS appliqués
        const borderCollapse = await table.evaluate(el => 
            window.getComputedStyle(el).borderCollapse
        );
        expect(borderCollapse).toBe('collapse');
        
        console.log('✅ Styles CSS des tableaux appliqués correctement');
    });
    
    test('doit charger le contenu depuis index.md', async ({ page }) => {
        await page.goto('http://localhost:8090/demo-npm.html');
        await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 });
        
        // Vérifier que le contenu markdown est présent
        const h1 = await page.locator('h1').filter({ hasText: 'Démonstration Complète' }).count();
        expect(h1).toBeGreaterThan(0);
        
        // Vérifier que plusieurs sections sont présentes
        const h2Count = await page.locator('h2').count();
        expect(h2Count).toBeGreaterThan(3);
        
        console.log(`✅ Contenu index.md chargé: ${h2Count} sections trouvées`);
    });
});
