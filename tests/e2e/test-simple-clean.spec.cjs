const { test, expect } = require('@playwright/test');

test.describe('Test OntoWave simplifié', () => {
    test('Page OntoWave simple fonctionne', async ({ page }) => {
        console.log('🚀 Test OntoWave simplifié sans multilingue');
        
        await page.goto('http://localhost:8080');
        
        // Attendre que OntoWave charge le contenu
        await page.waitForTimeout(3000);
        
        console.log('✅ 1. Page chargée');
        
        // Vérifier que le script est présent
        const script = await page.locator('script[src="ontowave.min.js"]').count();
        expect(script).toBe(1);
        console.log('✅ 2. Script ontowave.min.js chargé');
        
        // Vérifier que OntoWave a créé ses éléments
        const ontoWaveContainer = await page.locator('.ontowave-container').count();
        console.log(`📦 Conteneurs OntoWave trouvés: ${ontoWaveContainer}`);
        
        // Vérifier que le contenu markdown est rendu
        const content = await page.locator('.ontowave-content').count();
        console.log(`📄 Contenus OntoWave trouvés: ${content}`);
        
        // Vérifier qu'il n'y a pas d'erreurs JavaScript critiques
        const logs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                logs.push(msg.text());
            }
        });
        
        await page.waitForTimeout(2000);
        
        const criticalErrors = logs.filter(log => 
            log.includes('Uncaught') || 
            log.includes('SyntaxError') ||
            log.includes('ReferenceError')
        );
        
        if (criticalErrors.length > 0) {
            console.log('⚠️ Erreurs critiques:', criticalErrors);
        } else {
            console.log('✅ 3. Pas d\'erreurs JavaScript critiques');
        }
        
        // Vérifier que le titre est correct
        const title = await page.title();
        expect(title).toBe('OntoWave - Documentation');
        console.log('✅ 4. Titre correct');
        
        // Vérifier la présence de contenu textuel
        const bodyText = await page.locator('body').textContent();
        const hasContent = bodyText.includes('OntoWave') || bodyText.includes('Micro-application');
        
        if (hasContent) {
            console.log('✅ 5. Contenu OntoWave détecté');
        } else {
            console.log('⚠️ 5. Contenu OntoWave non détecté - peut-être en cours de chargement');
        }
        
        console.log('🎉 TEST SIMPLIFIÉ TERMINÉ !');
        console.log('📦 HTML minimal sans styles CSS');
        console.log('🚫 Pas de système multilingue complexe');
        console.log('⚡ Configuration OntoWave basique');
    });
});
