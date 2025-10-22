// @ts-check
const { test, expect } = require('@playwright/test')

test('Navigation PlantUML - Test final de production', async ({ page }) => {
  console.log('\n🚀 TEST NAVIGATION PLANTUML EN PRODUCTION\n')
  
  // Capturer les logs
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`))
  
  // 1. Aller sur la page d'accueil
  console.log('📄 Étape 1: Charger index.md')
  await page.goto('http://localhost:8000/#/index.md', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  
  // Vérifier que la page est chargée
  const h1Count = await page.locator('h1').count()
  console.log(`   ✅ H1 trouvés: ${h1Count}`)
  expect(h1Count).toBeGreaterThan(0)
  
  // 2. Vérifier que le lien PlantUML existe
  console.log('\n📊 Étape 2: Vérifier le lien architecture.puml')
  const pumlLink = page.locator('a[href="architecture.puml"]')
  const linkCount = await pumlLink.count()
  console.log(`   Liens PlantUML trouvés: ${linkCount}`)
  expect(linkCount).toBeGreaterThan(0)
  
  // 3. Naviguer directement vers le fichier PlantUML
  console.log('\n🎨 Étape 3: Naviguer vers architecture.puml')
  await page.goto('http://localhost:8000/#/architecture.puml', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
    
  // 4. Vérifier que le SVG PlantUML est affiché
  console.log('\n✅ Étape 4: Vérifier le SVG PlantUML')
  const svgCount = await page.locator('svg').count()
  console.log(`   SVG trouvés: ${svgCount}`)
  
  const currentUrl = page.url()
  console.log(`   URL actuelle: ${currentUrl}`)
  
  const title = await page.title()
  console.log(`   Titre: "${title}"`)
  
  const appContent = await page.locator('#app').innerHTML()
  console.log(`   Contenu #app: ${appContent.length} caractères`)
  
  // Screenshot
  await page.screenshot({ path: `test-puml-production-${Date.now()}.png`, fullPage: true })
  console.log(`   📸 Screenshot sauvegardé`)
  
  // Vérifications
  expect(currentUrl).toContain('architecture.puml')
  expect(svgCount).toBeGreaterThan(0)
  
  console.log('\n✅ TEST RÉUSSI: Navigation PlantUML fonctionne en production!')
})
