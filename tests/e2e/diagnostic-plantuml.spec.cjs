const { test, expect } = require('@playwright/test');

test('Diagnostic détaillé PlantUML', async ({ page }) => {
  // Aller sur la page
  await page.goto('http://localhost:8080/');
  
  // Attendre le chargement d'OntoWave
  await page.waitForFunction(() => window.OntoWave, { timeout: 10000 });
  await page.waitForFunction(() => document.body.children.length > 1, { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  console.log('🌊 OntoWave chargé');
  
  // Vérifier la configuration chargée
  const configLoaded = await page.evaluate(() => {
    if (window.OntoWave) {
      return {
        hasConfig: !!window.OntoWave.config,
        configKeys: window.OntoWave.config ? Object.keys(window.OntoWave.config) : [],
        enablePlantUML: window.OntoWave.config ? window.OntoWave.config.enablePlantUML : 'N/A'
      };
    }
    return null;
  });
  
  console.log('⚙️ Configuration :', configLoaded);
  
  // Vérifier les scripts chargés
  const loadedScripts = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map(s => s.src);
  });
  
  console.log('📜 Scripts chargés :', loadedScripts);
  
  // Vérifier les objets disponibles dans window
  const windowObjects = await page.evaluate(() => {
    const relevant = {};
    for (let key in window) {
      if (key.toLowerCase().includes('plant') || 
          key.toLowerCase().includes('uml') ||
          key.toLowerCase().includes('diagram')) {
        relevant[key] = typeof window[key];
      }
    }
    return relevant;
  });
  
  console.log('🌍 Objets window pertinents :', windowObjects);
  
  // Rechercher les erreurs de réseau
  const responses = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    }
  });
  
  // Attendre un peu pour capturer les erreurs réseau
  await page.waitForTimeout(2000);
  
  if (responses.length > 0) {
    console.log('❌ Erreurs réseau :', responses);
  } else {
    console.log('✅ Aucune erreur réseau');
  }
  
  // Vérifier le contenu markdown source
  const hasPlantUMLInSource = await page.evaluate(() => {
    const bodyText = document.body.textContent || document.body.innerText;
    return {
      hasStartUml: bodyText.includes('@startuml'),
      hasStartMindmap: bodyText.includes('@startmindmap'),
      hasPlantUMLText: bodyText.toLowerCase().includes('plantuml')
    };
  });
  
  console.log('📝 Contenu PlantUML dans source :', hasPlantUMLInSource);
  
  // Chercher les éléments SVG et leurs propriétés
  const svgElements = await page.$$eval('svg', svgs => 
    svgs.map(svg => ({
      id: svg.id,
      classes: svg.className.baseVal || svg.className,
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      hasPlantUMLId: (svg.id || '').includes('plantuml')
    }))
  );
  
  console.log('🖼️ Éléments SVG :', svgElements);
});
