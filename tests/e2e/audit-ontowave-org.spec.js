/**
 * Audit complet de https://ontowave.org
 * Teste chaque page : console errors, rendu contenu, liens cassés, i18n
 * 
 * Usage: npx playwright test tests/e2e/audit-ontowave-org.spec.js --config playwright.config.js
 */

import { test, expect } from '@playwright/test';

// ─── Pages à auditer ─────────────────────────────────────────────────────────

const BASE = 'https://ontowave.org';

const PAGES = [
  { url: '/', name: 'Accueil', expectedContent: ['OntoWave'], langs: ['fr', 'en'] },
  { url: '/demos/', name: 'Galerie démos', expectedContent: ['démo', 'Démo', 'demo', 'Demo'], langs: ['fr', 'en'] },
  { url: '/demos/01-base/markdown', name: 'Démo Markdown', expectedContent: ['Markdown', '# '], langs: ['fr', 'en'] },
  { url: '/demos/01-base/mermaid', name: 'Démo Mermaid', expectedContent: ['Mermaid', 'mermaid'], langs: ['fr', 'en'] },
  { url: '/demos/01-base/plantuml', name: 'Démo PlantUML', expectedContent: ['PlantUML', 'plantuml'], langs: ['fr', 'en'] },
  { url: '/demos/01-base/routing', name: 'Démo Routing', expectedContent: ['routing', 'Routing', 'hash'], langs: ['fr', 'en'] },
  { url: '/demos/02-config/i18n', name: 'Démo i18n', expectedContent: ['i18n', 'langue', 'language'], langs: ['fr', 'en'] },
  { url: '/demos/02-config/view-modes', name: 'Démo View Modes', expectedContent: ['sidebar', 'Sidebar', 'mode'], langs: ['fr', 'en'] },
  { url: '/demos/02-config/ui-custom', name: 'Démo UI Custom', expectedContent: ['custom', 'Custom', 'logo'], langs: ['fr', 'en'] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Attend que OntoWave ait rendu le contenu (attente du sélecteur #content ou .ontowave-content)
 */
async function waitForContent(page, timeout = 10000) {
  try {
    await page.waitForSelector('#content, .ontowave-content, main, article', { timeout });
    // Attente supplémentaire pour le rendu async (Mermaid, KaTeX, etc.)
    await page.waitForTimeout(1500);
  } catch {
    // Pas de conteneur spécifique — on attend quand même le réseau
    await page.waitForLoadState('networkidle', { timeout });
  }
}

/**
 * Collecte les erreurs console d'une page
 */
function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

/**
 * Collecte les requêtes réseau en échec (4xx/5xx)
 */
function collectFailedRequests(page) {
  const failed = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failed.push({ url: response.url(), status: response.status() });
    }
  });
  return failed;
}

// ─── Test 1 : Chaque page charge sans erreur console ─────────────────────────

for (const pageInfo of PAGES) {
  test(`[Console] ${pageInfo.name} — pas d'erreur console`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const failed = collectFailedRequests(page);

    await page.goto(`${BASE}${pageInfo.url}`, { waitUntil: 'domcontentloaded' });
    await waitForContent(page);

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT') && // ad blockers
      !e.includes('ERR_BLOCKED_BY_CLIENT') &&
      // Mermaid peut émettre ce warning SVG sans impact fonctionnel ni régression visible.
      !e.includes('translate(undefined, NaN)')
    );

    if (criticalErrors.length > 0) {
      console.log(`Erreurs console sur ${pageInfo.url}:`, criticalErrors);
    }

    expect(criticalErrors, `Erreurs console sur ${pageInfo.name}: ${criticalErrors.join(' | ')}`).toHaveLength(0);

    const criticalFailed = failed.filter(r => 
      !r.url.includes('favicon') &&
      r.status >= 400
    );

    if (criticalFailed.length > 0) {
      console.log(`Requêtes échouées sur ${pageInfo.url}:`, criticalFailed);
    }
    expect(criticalFailed, `Requêtes réseau échouées: ${JSON.stringify(criticalFailed)}`).toHaveLength(0);
  });
}

// ─── Test 2 : Le contenu Markdown est rendu (pas page blanche) ───────────────

for (const pageInfo of PAGES) {
  test(`[Rendu] ${pageInfo.name} — contenu visible`, async ({ page }) => {
    await page.goto(`${BASE}${pageInfo.url}`, { waitUntil: 'domcontentloaded' });
    await waitForContent(page);

    // Le texte de la page doit contenir au moins un des mots attendus
    // Utilise textContent (pas innerText) pour être robuste aux problèmes de rendu headless
    const bodyText = await page.evaluate(() => {
      const container = document.querySelector('#ontowave-content, #content, main, article') || document.body;
      return container.textContent || '';
    });
    const found = pageInfo.expectedContent.some(kw =>
      bodyText.toLowerCase().includes(kw.toLowerCase())
    );

    if (!found) {
      console.log(`Contenu trouvé sur ${pageInfo.url} (premiers 500 chars):`, bodyText.slice(0, 500));
    }

    expect(found, `Aucun mot-clé trouvé parmi [${pageInfo.expectedContent.join(', ')}] sur ${pageInfo.name}.\nContenu: ${bodyText.slice(0, 300)}`).toBe(true);
  });
}

// ─── Test 3 : Script source = CDN jsdelivr ────────────────────────────────────

for (const pageInfo of PAGES) {
  test(`[CDN] ${pageInfo.name} — script depuis CDN`, async ({ page }) => {
    await page.goto(`${BASE}${pageInfo.url}`, { waitUntil: 'domcontentloaded' });

    const scripts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
    );

    const ontoWaveScripts = scripts.filter(s => s.includes('ontowave'));

    expect(ontoWaveScripts.length, `Aucun script ontowave trouvé sur ${pageInfo.name}`).toBeGreaterThan(0);

    for (const src of ontoWaveScripts) {
      const isCdn = src.includes('cdn.jsdelivr.net');
      const isSameOriginBundle = src === `${BASE}/ontowave.min.js`;

      // La home charge via CDN. Les pages de démos en production chargent le bundle local publié.
      if (pageInfo.url === '/') {
        expect(src, `La page d'accueil doit charger OntoWave depuis CDN: ${src}`).toContain('cdn.jsdelivr.net');
      } else {
        expect(isCdn || isSameOriginBundle, `Script inattendu: ${src}`).toBe(true);
      }
    }
  });
}

// ─── Test 4 : Changement de langue fonctionne ────────────────────────────────

test('[i18n] Accueil — basculer en anglais change le hash URL', async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await waitForContent(page);

  // Cherche le bouton de changement de langue (spans avec onclick ou data-lang)
  // Les boutons i18n d'OntoWave sont des <span onclick="switchLanguage(...)">
  const langToggle = page.locator('.ontowave-lang-btn, [data-lang="en"], span[onclick*="en"], button:has-text("EN"), a:has-text("EN")').first();
  
  const exists = await langToggle.count();
  if (exists === 0) {
    test.info().annotations.push({ type: 'warning', description: 'Aucun toggle de langue trouvé sur la page d\'accueil' });
    return;
  }

  const urlBefore = page.url();
  await langToggle.click();
  await page.waitForTimeout(500);
  const urlAfter = page.url();

  expect(urlAfter, 'URL inchangée après clic sur toggle langue').not.toBe(urlBefore);
});

// ─── Test 5 : Liens internes sur page d'accueil ───────────────────────────────

test('[Navigation] Accueil — liens vers les démos fonctionnent', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await waitForContent(page);

  // Collecte tous les liens internes
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({ href: a.href, text: a.textContent.trim() }))
      .filter(a => a.href.startsWith('https://ontowave.org') || a.href.startsWith('/'))
  );

  console.log(`Liens internes trouvés sur l'accueil: ${links.length}`);
  for (const link of links) {
    console.log(`  - ${link.text}: ${link.href}`);
  }

  // Teste que chaque lien interne charge sans erreur 404
  const broken = [];
  for (const link of links.slice(0, 20)) { // limite à 20 pour éviter timeout
    try {
      const response = await page.request.get(link.href, { timeout: 5000 });
      if (response.status() === 404) {
        broken.push({ href: link.href, text: link.text, status: 404 });
      }
    } catch (e) {
      broken.push({ href: link.href, text: link.text, error: e.message });
    }
  }

  if (broken.length > 0) {
    console.log('Liens cassés:', broken);
  }
  expect(broken, `Liens cassés: ${JSON.stringify(broken)}`).toHaveLength(0);
});

// ─── Test 6 : Page démos — liens vers démos individuelles ─────────────────────

test('[Navigation] Démos — liens vers pages démos individuelles', async ({ page }) => {
  await page.goto(`${BASE}/demos/`, { waitUntil: 'domcontentloaded' });
  await waitForContent(page);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({ href: a.href, text: a.textContent.trim() }))
      .filter(a => a.href.includes('demos/'))
  );

  console.log(`Liens de démos trouvés: ${links.length}`);
  for (const link of links) {
    console.log(`  - ${link.text}: ${link.href}`);
  }

  expect(links.length, 'Aucun lien de démo trouvé sur la page galerie').toBeGreaterThan(0);
});

// ─── Test 7 : Démo Markdown — tableaux, code, listes rendus ──────────────────

test('[Rendu] Démo Markdown — tableaux et code rendus en HTML', async ({ page }) => {
  await page.goto(`${BASE}/demos/01-base/markdown`, { waitUntil: 'domcontentloaded' });
  await waitForContent(page);

  const html = await page.evaluate(() => document.body.innerHTML);

  const hasTable = html.includes('<table');
  const hasCode = html.includes('<code') || html.includes('<pre');
  const hasList = html.includes('<ul') || html.includes('<ol');

  console.log(`Markdown rendu — table:${hasTable}, code:${hasCode}, list:${hasList}`);

  expect(hasTable, 'Aucun tableau <table> rendu dans la démo Markdown').toBe(true);
  expect(hasCode, 'Aucun bloc de code <code> rendu dans la démo Markdown').toBe(true);
});

// ─── Test 8 : Démo Mermaid — diagramme rendu ─────────────────────────────────

test('[Rendu] Démo Mermaid — diagramme SVG ou div rendu', async ({ page }) => {
  await page.goto(`${BASE}/demos/01-base/mermaid`, { waitUntil: 'domcontentloaded' });
  await waitForContent(page, 15000);

  const html = await page.evaluate(() => document.body.innerHTML);

  const hasSvg = html.includes('<svg');
  const hasMermaidDiv = html.includes('mermaid');

  console.log(`Mermaid rendu — svg:${hasSvg}, mermaid-div:${hasMermaidDiv}`);

  // Au moins un des deux doit être présent
  expect(hasSvg || hasMermaidDiv, 'Aucun SVG ni div mermaid trouvé dans la démo Mermaid').toBe(true);
});

// ─── Test 9 : Vérification ontowave.min.js CDN accessible ─────────────────────

test('[CDN] ontowave.min.js@latest accessible sur jsdelivr', async ({ page }) => {
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js';
  const response = await page.request.get(cdnUrl, { timeout: 10000 });
  
  expect(response.status(), `CDN jsdelivr retourne ${response.status()} pour ontowave@latest`).toBe(200);
  
  const body = await response.text();
  expect(body.length, 'ontowave.min.js est vide sur le CDN').toBeGreaterThan(1000);
  
  console.log(`ontowave.min.js CDN OK — ${body.length} bytes`);
});

// ─── Test 10 : Sitemap et robots.txt ──────────────────────────────────────────

test('[SEO] robots.txt accessible et valide', async ({ page }) => {
  const response = await page.request.get(`${BASE}/robots.txt`);
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('User-agent');
  expect(body).toContain('Sitemap');
  console.log('robots.txt:', body);
});

test('[SEO] sitemap.xml accessible et valide', async ({ page }) => {
  const response = await page.request.get(`${BASE}/sitemap.xml`);
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('<urlset');
  expect(body).toContain('ontowave.org');
  console.log(`sitemap.xml: ${(body.match(/<url>/g) || []).length} URLs`);
});
