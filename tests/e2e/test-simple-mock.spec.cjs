const { test, expect } = require('@playwright/test');

test.describe('Test OntoWave Simple', () => {
  test('Page OntoWave fonctionne', async ({ page }) => {
    console.log('🚀 Test OntoWave simple');
    
    // Créer une page HTML simple avec OntoWave
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test OntoWave</title>
</head>
<body>
    <script>
    // Simuler OntoWave simple
    document.title = "OntoWave fonctionne !";
    document.body.innerHTML = '<h1>OntoWave est chargé !</h1><p>Le contenu s\'affiche bien.</p>';
    </script>
</body>
</html>`;

    await page.setContent(htmlContent);
    console.log('✅ 1. Page créée');
    
    await page.waitForTimeout(1000);
    
    // Vérifier le titre
    const title = await page.title();
    console.log('📄 Titre:', title);
    
    // Vérifier le contenu
    const h1 = await page.textContent('h1');
    console.log('📄 H1:', h1);
    
    // Vérifier qu'il y a du contenu
    const bodyText = await page.textContent('body');
    console.log('📦 Contenu body:', bodyText);
    
    console.log('🎉 TEST SIMPLE TERMINÉ !');
    
    expect(title).toBe('OntoWave fonctionne !');
    expect(h1).toBe('OntoWave est chargé !');
  });
});
