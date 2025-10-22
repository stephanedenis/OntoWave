import { test, expect } from '@playwright/test'

test('Navigation depuis PlantUML vers Markdown', async ({ page }) => {
  // 1. Charger le diagramme avec liens
  console.log('📍 Étape 1: Chargement test-navigation.puml')
  await page.goto('http://localhost:8000/#test-navigation.puml', { timeout: 10000 })
  await page.waitForSelector('#app', { timeout: 15000 })
  await page.waitForTimeout(2000)
  
  // Vérifier que le SVG est chargé
  const svgCount = await page.locator('svg').count()
  console.log('🎨 SVG trouvés:', svgCount)
  expect(svgCount).toBeGreaterThan(0)
  
  // Capturer l'état initial
  await page.screenshot({ path: 'test-nav-1-initial.png', fullPage: true })
  
  // 2. Chercher et cliquer sur le lien vers Markdown
  console.log('📍 Étape 2: Recherche du lien vers index.md')
  
  // PlantUML génère des liens <a> dans le SVG
  const links = await page.locator('svg a').all()
  console.log('🔗 Liens trouvés dans SVG:', links.length)
  
  for (let i = 0; i < links.length; i++) {
    const href = await links[i].getAttribute('href')
    const text = await links[i].textContent()
    console.log(`   Link ${i}: href="${href}", text="${text}"`)
  }
  
  // Chercher un lien contenant "index.md"
  const mdLink = page.locator('svg a[href*="index.md"]').first()
  const mdLinkExists = await mdLink.count() > 0
  console.log('�� Lien vers .md trouvé:', mdLinkExists)
  
  if (mdLinkExists) {
    console.log('🖱️  Clic sur lien vers index.md')
    await mdLink.click()
    await page.waitForTimeout(2000)
    
    // Vérifier le changement d'URL
    const newUrl = page.url()
    console.log('🌐 Nouvelle URL:', newUrl)
    expect(newUrl).toContain('index.md')
    
    await page.screenshot({ path: 'test-nav-2-after-md-click.png', fullPage: true })
  }
  
  // 3. Retour et test navigation vers autre PlantUML
  console.log('📍 Étape 3: Retour au diagramme')
  await page.goto('http://localhost:8000/#test-navigation.puml', { timeout: 10000 })
  await page.waitForSelector('#app', { timeout: 15000 })
  await page.waitForTimeout(2000)
  
  const pumlLink = page.locator('svg a[href*=".puml"]').first()
  const pumlLinkExists = await pumlLink.count() > 0
  console.log('📊 Lien vers autre .puml trouvé:', pumlLinkExists)
  
  if (pumlLinkExists) {
    const linkHref = await pumlLink.getAttribute('href')
    console.log('🔗 Lien trouvé:', linkHref)
    console.log('🖱️  Clic sur lien vers autre diagramme')
    await pumlLink.click()
    await page.waitForTimeout(2000)
    
    const finalUrl = page.url()
    console.log('🌐 URL finale:', finalUrl)
    
    await page.screenshot({ path: 'test-nav-3-after-puml-click.png', fullPage: true })
  }
})
