import { test, expect } from '@playwright/test';

test.describe('OntoWave Debug Complet', () => {
  test('diagnostic complet après fix', async ({ page }) => {
    const allLogs = [];
    const networkErrors = [];
    
    page.on('console', msg => allLogs.push({ type: msg.type(), text: msg.text() }));
    page.on('requestfailed', req => networkErrors.push(req.url()));

    await page.goto('http://localhost:8082/');
    await page.waitForTimeout(3000);

    console.log('\n=== TOUTES LES ERREURS CONSOLE ===');
    allLogs.filter(log => log.type === 'error').forEach((log, i) => {
      console.log(`${i+1}. ${log.text}`);
    });

    console.log('\n=== ERREURS RÉSEAU ===');
    networkErrors.forEach((url, i) => {
      console.log(`${i+1}. ${url}`);
    });

    console.log('\n=== ÉTAT JS GLOBAL ===');
    const globalState = await page.evaluate(() => {
      return {
        hasOntoWave: typeof window.OntoWave !== 'undefined',
        hasRouter: typeof window.router !== 'undefined',
        hasConfig: typeof window.config !== 'undefined',
        windowKeys: Object.keys(window).filter(key => !key.startsWith('webkit') && !key.startsWith('chrome')).slice(0, 10)
      };
    });
    
    console.log('État global:', globalState);

    // Test direct du markdown
    const markdownTest = await page.evaluate(() => {
      // Test si MarkdownIt est disponible globalement
      const markdownItAvailable = typeof window.markdownit !== 'undefined';
      
      if (markdownItAvailable) {
        try {
          const md = window.markdownit({ tables: true });
          const result = md.render('| A | B |\n|---|---|\n| 1 | 2 |');
          return { success: true, html: result, hasTable: result.includes('<table>') };
        } catch (e) {
          return { success: false, error: e.message };
        }
      }
      
      return { success: false, error: 'MarkdownIt non disponible' };
    });

    console.log('\n=== TEST MARKDOWN DIRECT ===');
    console.log('Résultat:', markdownTest);

    expect(true).toBeTruthy(); // Ne pas faire échouer
  });
});