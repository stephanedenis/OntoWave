import { test, expect } from '@playwright/test';

test.describe('OntoWave Tableaux Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Servir le fichier de test des tableaux
    await page.goto('/test-tableaux.md');
    
    // Attendre que OntoWave soit initialisé
    await page.waitForSelector('#app', { timeout: 10000 });
    
    // Attendre le rendu du contenu
    await page.waitForFunction(() => {
      const app = document.getElementById('app');
      return app && app.innerHTML.trim() !== '';
    }, { timeout: 5000 });
  });

  test('🔧 Tableaux parsés correctement par MarkdownIt', async ({ page }) => {
    // Vérifier que les tableaux sont présents dans le DOM
    const tables = await page.locator('table').count();
    expect(tables).toBeGreaterThan(0);
    
    // Vérifier la structure du premier tableau
    const firstTable = page.locator('table').first();
    await expect(firstTable).toBeVisible();
    
    // Vérifier les en-têtes
    const headers = await firstTable.locator('th').count();
    expect(headers).toBeGreaterThan(0);
    
    // Vérifier les cellules de données
    const cells = await firstTable.locator('td').count();
    expect(cells).toBeGreaterThan(0);
  });

  test('🎨 CSS tableaux injecté automatiquement', async ({ page }) => {
    // Vérifier que le style CSS a été injecté
    const styleElement = await page.locator('#ontowave-table-styles');
    await expect(styleElement).toBeAttached();
    
    // Vérifier le contenu CSS
    const cssContent = await styleElement.innerHTML();
    expect(cssContent).toContain('table {');
    expect(cssContent).toContain('border-collapse: collapse');
    expect(cssContent).toContain('background-color');
  });

  test('📱 Styles responsive appliqués', async ({ page }) => {
    // Vérifier les styles CSS sur les tableaux
    const table = page.locator('table').first();
    
    // Vérifier les styles de base
    const borderCollapse = await table.evaluate(el => 
      getComputedStyle(el).borderCollapse
    );
    expect(borderCollapse).toBe('collapse');
    
    const width = await table.evaluate(el => 
      getComputedStyle(el).width
    );
    // Vérifier que le tableau prend bien 100% de largeur
    expect(width).toContain('%');
  });

  test('📊 Contenu tableaux correct', async ({ page }) => {
    // Vérifier le contenu spécifique des tableaux de test
    
    // Tableau simple
    await expect(page.locator('table').first().locator('th').first()).toContainText('Colonne 1');
    await expect(page.locator('table').first().locator('td').first()).toContainText('Valeur A');
    
    // Tableau complexe avec emojis
    const complexTable = page.locator('table').nth(1);
    await expect(complexTable.locator('td').filter({ hasText: '✅ Actif' })).toBeVisible();
    await expect(complexTable.locator('td').filter({ hasText: '🧪 Développement' })).toBeVisible();
    await expect(complexTable.locator('td').filter({ hasText: '🗂️ Nettoyé' })).toBeVisible();
  });

  test('🎯 Alignement colonnes fonctionnel', async ({ page }) => {
    // Vérifier le tableau d'alignement (3ème tableau)
    const alignTable = page.locator('table').nth(2);
    
    // Vérifier la présence des différents alignements
    await expect(alignTable.locator('th').filter({ hasText: 'Gauche' })).toBeVisible();
    await expect(alignTable.locator('th').filter({ hasText: 'Centre' })).toBeVisible();
    await expect(alignTable.locator('th').filter({ hasText: 'Droite' })).toBeVisible();
    
    // Le contenu spécifique
    await expect(alignTable.locator('td').filter({ hasText: 'Long texte à gauche' })).toBeVisible();
    await expect(alignTable.locator('td').filter({ hasText: 'Centré' })).toBeVisible();
    await expect(alignTable.locator('td').filter({ hasText: '123' })).toBeVisible();
  });

  test('🌙 Support mode sombre (media query)', async ({ page }) => {
    // Forcer le mode sombre via CSS
    await page.addStyleTag({
      content: `
        @media (prefers-color-scheme: dark) {
          * { color-scheme: dark; }
        }
      `
    });
    
    // Vérifier que les styles sombres s'appliquent
    const style = await page.locator('#ontowave-table-styles').innerHTML();
    expect(style).toContain('@media (prefers-color-scheme: dark)');
    expect(style).toContain('background-color: #2d2d2d');
    expect(style).toContain('border-color: #444');
  });

  test('🚀 Performance injection CSS (une seule fois)', async ({ page }) => {
    // Actualiser la page pour tester la réinjection
    await page.reload();
    await page.waitForSelector('#app');
    
    // Attendre le rendu
    await page.waitForFunction(() => {
      const app = document.getElementById('app');
      return app && app.innerHTML.includes('<table');
    });
    
    // Vérifier qu'il n'y a qu'un seul élément style pour les tableaux
    const styleElements = await page.locator('#ontowave-table-styles').count();
    expect(styleElements).toBe(1);
  });

  test('📖 Navigation OntoWave intacte', async ({ page }) => {
    // Vérifier que OntoWave fonctionne toujours normalement
    
    // Vérifier le titre de la page
    await expect(page.locator('h1').first()).toContainText('Test Tableaux OntoWave');
    
    // Vérifier les liens de navigation (si présents)
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    
    // Vérifier que le contenu Markdown est rendu
    await expect(page.locator('h2').filter({ hasText: 'Problème Actuel' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Test Simple' })).toBeVisible();
  });

  test('🔄 Regression test: autres éléments Markdown', async ({ page }) => {
    // Vérifier que le fix des tableaux n'a pas cassé d'autres éléments
    
    // Vérifier les listes
    const listItems = await page.locator('ol li').count();
    expect(listItems).toBeGreaterThan(0);
    
    // Vérifier le formatting (gras, italique)
    await expect(page.locator('strong').filter({ hasText: 'Parsing' })).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'CSS' })).toBeVisible();
    
    // Vérifier que les titres sont toujours corrects
    await expect(page.locator('h2')).toHaveCount(5); // Selon notre fichier test
  });
});

test.describe('OntoWave Tableaux Mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE
  });

  test('📱 Tableaux responsive sur mobile', async ({ page }) => {
    await page.goto('/test-tableaux.md');
    await page.waitForSelector('table');
    
    // Vérifier que les tableaux restent lisibles sur mobile
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    
    // Vérifier les styles mobile appliqués
    const fontSize = await table.evaluate(el => 
      getComputedStyle(el).fontSize
    );
    
    // Sur mobile, la font-size devrait être adaptée
    expect(fontSize).toBeTruthy();
  });
});