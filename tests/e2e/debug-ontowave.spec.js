import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('OntoWave Debug', () => {
  test('diagnostic erreurs OntoWave', async ({ page }) => {
    // Capturer TOUTES les messages console
    const allLogs = [];
    page.on('console', msg => {
      allLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Capturer les erreurs réseau
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()
      });
    });

    // Naviguer vers OntoWave
    await page.goto('file://' + path.resolve('./docs/index.html'));
    
    // Attendre et observer
    await page.waitForTimeout(5000);

    console.log('\n=== LOGS CONSOLE ===');
    allLogs.forEach((log, i) => {
      console.log(`${i+1}. [${log.type.toUpperCase()}] ${log.text}`);
      if (log.location) {
        console.log(`   Lieu: ${log.location.url}:${log.location.lineNumber}`);
      }
    });

    console.log('\n=== ERREURS RÉSEAU ===');
    networkErrors.forEach((error, i) => {
      console.log(`${i+1}. URL: ${error.url}`);
      console.log(`   Erreur: ${error.failure?.errorText || 'Inconnue'}`);
    });

    // Examiner l'état du DOM
    const domInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasOntoWave: typeof window.OntoWave !== 'undefined',
        scripts: Array.from(document.scripts).map(s => s.src || 'inline'),
        bodyContent: document.body.innerText.substring(0, 200)
      };
    });

    console.log('\n=== INFO DOM ===');
    console.log('Titre:', domInfo.title);
    console.log('OntoWave présent:', domInfo.hasOntoWave);
    console.log('Scripts chargés:', domInfo.scripts.length);
    console.log('Contenu body:', domInfo.bodyContent);

    // Chercher les scripts spécifiquement
    const scriptAnalysis = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      return scripts.map(script => ({
        src: script.src,
        type: script.type,
        loaded: !script.src || script.readyState === 'complete',
        hasError: !!script.onerror
      }));
    });

    console.log('\n=== ANALYSE SCRIPTS ===');
    scriptAnalysis.forEach((script, i) => {
      console.log(`${i+1}. Source: ${script.src || 'inline'}`);
      console.log(`   Type: ${script.type}`);
      console.log(`   Chargé: ${script.loaded}`);
      console.log(`   Erreur: ${script.hasError}`);
    });

    // Ce test ne doit pas échouer, juste diagnostiquer
    expect(true).toBeTruthy();
  });
});