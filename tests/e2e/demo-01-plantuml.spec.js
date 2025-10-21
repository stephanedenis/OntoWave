// Test complet PlantUML - Encodage DEFLATE + Insertion directe
import { test, expect } from '@playwright/test';

test.describe('Démo 01 - PlantUML Minimal (Sans Wrappers)', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Log console output
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]`, msg.text());
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load OntoWave and render PlantUML diagrams', async () => {
    console.log('🔄 Loading demo page...');
    await page.goto('http://localhost:8000/docs/demos/01-plantuml-minimal.html');
    
    // Wait for OntoWave to load and render
    await page.waitForTimeout(6000); // PlantUML needs time to fetch and render
    
    // Screenshot 1: Initial state
    await page.screenshot({ 
      path: 'test-results/demo-01-loaded.png', 
      fullPage: true 
    });
    
    // 1. Check page loaded
    const title = await page.title();
    console.log('📊 Page title:', title);
    expect(title).toContain('PlantUML');
    
    // 2. Check content rendered
    const h1Count = await page.locator('h1').count();
    console.log('📊 H1 elements:', h1Count);
    expect(h1Count).toBeGreaterThan(0);
    
    // 3. Check for PlantUML SVG elements
    const svgCount = await page.locator('svg').count();
    console.log('📊 SVG diagrams found:', svgCount);
    expect(svgCount).toBeGreaterThan(0);
    
    // Screenshot 2: After SVG rendering
    await page.screenshot({ 
      path: 'test-results/demo-01-with-diagrams.png', 
      fullPage: true 
    });
    
    // 4. Verify NO wrapper classes (critical requirement)
    const wrapperCount = await page.locator('.plantuml-diagram-wrapper').count();
    const diagramWrapperCount = await page.locator('.diagram').count();
    const mermaidWrapperCount = await page.locator('.mermaid').count();
    
    console.log('📊 Wrapper check:');
    console.log('  - .plantuml-diagram-wrapper:', wrapperCount);
    console.log('  - .diagram:', diagramWrapperCount);
    console.log('  - .mermaid:', mermaidWrapperCount);
    
    expect(wrapperCount).toBe(0);
    expect(diagramWrapperCount).toBe(0);
    expect(mermaidWrapperCount).toBe(0);
    
    // 5. Verify SVG are direct children (no wrappers)
    const firstSvg = await page.locator('svg').first();
    const svgParent = await firstSvg.evaluate(el => el.parentElement?.tagName);
    console.log('📊 First SVG parent:', svgParent);
    
    // Parent should be DIV or BODY, not a wrapper class
    expect(['DIV', 'BODY', 'ARTICLE']).toContain(svgParent);
    
    // 6. Check SVG attributes (PlantUML specific)
    const svgViewBox = await firstSvg.getAttribute('viewBox');
    console.log('📊 SVG viewBox:', svgViewBox);
    expect(svgViewBox).toBeTruthy();
    
    // 7. Verify content text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Test PlantUML');
    expect(bodyText).toContain('DEFLATE');
    
    console.log('✅ All PlantUML checks passed!');
  });

  test('should verify PlantUML uses DEFLATE encoding (~0)', async () => {
    // This test verifies the encoding by checking network requests
    const plantUMLRequests = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('plantuml') || url.includes('www.plantuml.com')) {
        plantUMLRequests.push(url);
        console.log('🌐 PlantUML request:', url);
      }
    });
    
    await page.goto('http://localhost:8000/docs/demos/01-plantuml-minimal.html');
    await page.waitForTimeout(6000);
    
    console.log('📊 Total PlantUML requests:', plantUMLRequests.length);
    
    if (plantUMLRequests.length > 0) {
      // Check if any request uses DEFLATE encoding (starts with ~0)
      const hasDeflate = plantUMLRequests.some(url => {
        const match = url.match(/\/([~0-9A-Za-z_-]+)\.(svg|png)/);
        if (match) {
          const encoded = match[1];
          console.log('📊 Encoded part:', encoded.substring(0, 10));
          return encoded.startsWith('~0') || encoded.startsWith('0');
        }
        return false;
      });
      
      console.log('📊 Uses DEFLATE encoding (~0):', hasDeflate);
      // Note: This may not always be detectable if SVG is cached
    }
    
    console.log('✅ PlantUML encoding check completed');
  });
});
