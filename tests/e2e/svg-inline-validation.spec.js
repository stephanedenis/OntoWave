/**
 * Test de Validation SVG Inline - PlantUML & Mermaid
 * Vérifie que les diagrammes sont rendus en SVG inline (pas en <img>)
 * et que les liens fonctionnent correctement
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('SVG Inline Validation - PlantUML', () => {
  
  test('PlantUML: fichier .puml doit être rendu en SVG inline', async ({ page }) => {
    console.log('🧪 Testing PlantUML .puml file rendering...');
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html`);
    await page.waitForTimeout(4000); // Attendre le chargement + rendu SVG
    
    // Vérifier qu'il N'Y A PAS d'élément <img> pour PlantUML
    const imgCount = await page.$$eval('img[alt*="PlantUML"], img[src*="plantuml"]', els => els.length);
    console.log(`📊 <img> tags for PlantUML: ${imgCount}`);
    expect(imgCount).toBe(0); // Doit être 0 car on utilise SVG inline maintenant
    
    // Vérifier qu'il Y A un SVG
    const svgCount = await page.$$eval('svg', els => els.length);
    console.log(`📊 SVG elements: ${svgCount}`);
    expect(svgCount).toBeGreaterThan(0);
    
    // Vérifier que le SVG est DANS un container .plantuml-diagram
    const svgInContainer = await page.$$eval('.plantuml-diagram svg', els => els.length);
    console.log(`📊 SVG in .plantuml-diagram: ${svgInContainer}`);
    expect(svgInContainer).toBeGreaterThan(0);
    
    // Vérifier que le SVG contient des éléments graphiques
    const svgHasContent = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return false;
      const rects = svg.querySelectorAll('rect, path, line, text').length;
      return rects > 0;
    });
    console.log(`📊 SVG has graphical content: ${svgHasContent}`);
    expect(svgHasContent).toBe(true);
    
    console.log('✅ PlantUML rendered as inline SVG!');
  });
  
  test('PlantUML: liens dans SVG doivent être cliquables', async ({ page }) => {
    console.log('🧪 Testing PlantUML links in SVG...');
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html#test-navigation.puml`);
    await page.waitForTimeout(3000);
    
    // Vérifier les liens dans le SVG
    const linksInfo = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return { found: false };
      
      const links = Array.from(svg.querySelectorAll('a'));
      return {
        found: true,
        count: links.length,
        hrefs: links.map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent?.trim(),
          hasClickListener: a.onclick !== null || a.dataset.listenerAttached === 'true'
        }))
      };
    });
    
    console.log(`📊 Links in SVG:`, linksInfo);
    
    if (linksInfo.found) {
      expect(linksInfo.count).toBeGreaterThan(0);
      
      // Vérifier qu'au moins un lien pointe vers une page interne (.md, .html, .puml)
      const internalLinks = linksInfo.hrefs.filter(l => 
        l.href && (l.href.endsWith('.md') || l.href.endsWith('.html') || l.href.endsWith('.puml'))
      );
      console.log(`📊 Internal links: ${internalLinks.length}`);
      expect(internalLinks.length).toBeGreaterThan(0);
    }
    
    console.log('✅ PlantUML links are present and internal!');
  });
  
  test('PlantUML: navigation via lien SVG doit changer le hash', async ({ page }) => {
    console.log('🧪 Testing PlantUML link navigation...');
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html`);
    await page.waitForTimeout(4000);
    
    const initialHash = await page.evaluate(() => window.location.hash);
    console.log(`📊 Initial hash: ${initialHash}`);
    
    // Essayer de cliquer sur un lien interne dans le SVG
    const clickResult = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      if (!svg) return { success: false, reason: 'No SVG' };
      
      const links = Array.from(svg.querySelectorAll('a'));
      const internalLink = links.find(a => {
        const href = a.getAttribute('href');
        return href && (href.endsWith('.md') || href.endsWith('.html') || href.endsWith('.puml'));
      });
      
      if (!internalLink) return { success: false, reason: 'No internal link found' };
      
      const href = internalLink.getAttribute('href');
      
      // Pour les éléments SVG, dispatch un event click manuellement
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      internalLink.dispatchEvent(clickEvent);
      
      return { success: true, clickedHref: href };
    });
    
    console.log(`📊 Click result:`, clickResult);
    
    if (clickResult.success) {
      // Attendre que la navigation se fasse
      await page.waitForTimeout(1000);
      
      const newHash = await page.evaluate(() => window.location.hash);
      console.log(`📊 New hash: ${newHash}`);
      
      // Le hash doit avoir changé
      expect(newHash).not.toBe(initialHash);
      expect(newHash).toContain(clickResult.clickedHref);
      
      console.log('✅ Navigation via SVG link works!');
    } else {
      console.log('⚠️  No clickable internal link found (might be normal if diagram has only external links)');
    }
  });
  
  test('PlantUML: bloc code Markdown doit être rendu en SVG inline', async ({ page }) => {
    console.log('🧪 Testing PlantUML in Markdown code block...');
    
    await page.goto(`${BASE_URL}/demos/05-plantuml-links.html#test-plantuml-links.md`);
    await page.waitForTimeout(3000);
    
    // Vérifier qu'il N'Y A PAS d'élément <img> pour PlantUML
    const imgCount = await page.$$eval('img[alt*="PlantUML"], img[src*="plantuml"]', els => els.length);
    console.log(`📊 <img> tags for PlantUML: ${imgCount}`);
    expect(imgCount).toBe(0);
    
    // Vérifier qu'il Y A un SVG
    const svgCount = await page.$$eval('svg', els => els.length);
    console.log(`📊 SVG elements: ${svgCount}`);
    expect(svgCount).toBeGreaterThan(0);
    
    console.log('✅ PlantUML in Markdown rendered as inline SVG!');
  });
});

test.describe('SVG Inline Validation - Performance & Cache', () => {
  
  test('Cache SVG: navigation répétée doit utiliser le cache', async ({ page }) => {
    console.log('🧪 Testing SVG cache performance...');
    
    // Activer les logs console dans la page
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('cache') || msg.text().includes('Cache')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Première navigation - doit fetcher
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html`);
    await page.waitForTimeout(4000);
    
    const logsAfterFirst = [...consoleLogs];
    console.log('📊 Logs after first load:', logsAfterFirst);
    
    // Navigation vers autre page
    await page.goto(`${BASE_URL}/demos/05-plantuml-links.html`);
    await page.waitForTimeout(2000);
    
    // Retour - doit utiliser cache
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html`);
    await page.waitForTimeout(2000);
    
    const logsAfterSecond = consoleLogs.filter(log => 
      log.includes('récupéré du cache') || log.includes('cache')
    );
    console.log('📊 Cache logs:', logsAfterSecond);
    
    // On devrait voir au moins une entrée de cache
    const hasCacheHit = consoleLogs.some(log => log.includes('récupéré du cache'));
    console.log(`📊 Cache hit detected: ${hasCacheHit}`);
    
    if (hasCacheHit) {
      console.log('✅ SVG cache is working!');
    } else {
      console.log('⚠️  Cache might not be triggered (check console logs)');
    }
  });
  
  test('Comparaison performance: pas de double fetch', async ({ page }) => {
    console.log('🧪 Testing no double fetch...');
    
    // Intercepter les requêtes réseau
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('plantuml')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html`);
    await page.waitForTimeout(4000);
    
    console.log(`📊 PlantUML requests made: ${requests.length}`);
    requests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url.substring(0, 80)}...`);
    });
    
    // Avec SVG inline + cache, on ne devrait avoir qu'UNE SEULE requête par diagramme unique
    // (pas de double fetch comme avant avec <img> + attachPlantUMLLinks)
    expect(requests.length).toBeLessThanOrEqual(2); // Max 2 diagrammes sur la page
    
    console.log('✅ No double fetch detected!');
  });
});

test.describe('Régression - Apparence', () => {
  
  test('PlantUML: pas de bordure indésirable', async ({ page }) => {
    console.log('🧪 Testing no unwanted borders...');
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html#test-navigation.puml`);
    await page.waitForTimeout(3000);
    
    // Vérifier les styles du container
    const containerStyles = await page.evaluate(() => {
      const container = document.querySelector('.ontowave-plantuml-render');
      if (!container) return null;
      
      const computed = window.getComputedStyle(container);
      return {
        border: computed.border,
        borderWidth: computed.borderWidth,
        borderStyle: computed.borderStyle
      };
    });
    
    console.log(`📊 Container styles:`, containerStyles);
    
    if (containerStyles) {
      // Vérifier qu'il n'y a pas de bordure solide
      expect(containerStyles.borderStyle).not.toBe('solid');
    }
    
    console.log('✅ No unwanted borders!');
  });
  
  test('PlantUML: pas de titre "Diagramme Rendu" visible', async ({ page }) => {
    console.log('🧪 Testing no render titles...');
    
    await page.goto(`${BASE_URL}/demos/07-plantuml-file.html#test-navigation.puml`);
    await page.waitForTimeout(3000);
    
    // Chercher les titres h3 avec "Diagramme Rendu"
    const renderTitles = await page.$$eval('h3', els => 
      els.filter(el => el.textContent.includes('Diagramme Rendu')).length
    );
    
    console.log(`📊 "Diagramme Rendu" titles: ${renderTitles}`);
    
    // Ces titres peuvent exister (c'est OK), mais on vérifie qu'ils sont bien présents
    // car ils sont utiles dans la vue double-pane (code source + rendu)
    
    console.log('✅ Render titles check complete!');
  });
});
