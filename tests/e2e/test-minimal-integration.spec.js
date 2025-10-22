import { test, expect } from '@playwright/test'

test('PlantUML dans Markdown - Intégration minimaliste', async ({ page }) => {
  console.log('📍 Chargement Markdown avec PlantUML intégré')
  await page.goto('http://localhost:8000/#test-md-with-plantuml.md', { timeout: 10000 })
  await page.waitForSelector('#app', { timeout: 15000 })
  await page.waitForTimeout(3000) // Attendre le rendu PlantUML via Kroki
  
  // Vérifier que le contenu Markdown est chargé
  const content = await page.locator('#app').textContent()
  console.log('📄 Contenu chargé:', content.substring(0, 100))
  expect(content).toContain('Test PlantUML dans Markdown')
  
  // Vérifier la présence des SVG PlantUML
  const svgCount = await page.locator('svg').count()
  console.log('🎨 SVG trouvés:', svgCount)
  expect(svgCount).toBeGreaterThan(0)
  
  // Vérifier qu'il n'y a PAS de wrapper superflu
  const wrappers = await page.locator('.plantuml-diagram-wrapper, .diagram, .mermaid').count()
  console.log('📦 Wrappers trouvés:', wrappers)
  
  if (wrappers === 0) {
    console.log('✅ Aucun wrapper - intégration minimaliste parfaite!')
  } else {
    console.log('⚠️  Des wrappers sont présents')
  }
  
  // Vérifier les liens dans les SVG PlantUML
  const svgLinks = await page.locator('svg a').count()
  console.log('🔗 Liens dans SVG:', svgLinks)
  
  if (svgLinks > 0) {
    const links = await page.locator('svg a').all()
    console.log('📋 Détails des liens:')
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const href = await links[i].getAttribute('href')
      const text = await links[i].textContent()
      console.log(`   ${i+1}. ${href} - "${text}"`)
    }
  }
  
  await page.screenshot({ path: 'test-minimal-md-plantuml.png', fullPage: true })
  
  console.log('\n✅ Test intégration minimaliste terminé!')
})

test('Fichier PlantUML standalone - Vérifier absence de wrapper', async ({ page }) => {
  console.log('\n📍 Test fichier .puml standalone')
  await page.goto('http://localhost:8000/#architecture.puml', { timeout: 10000 })
  await page.waitForTimeout(3000)
  
  const svg = await page.locator('svg').count()
  console.log('🎨 SVG trouvés:', svg)
  expect(svg).toBeGreaterThan(0)
  
  // Vérifier structure HTML minimaliste
  const appHTML = await page.locator('#app').innerHTML()
  const hasWrapper = appHTML.includes('class="plantuml-diagram-wrapper"') || 
                     appHTML.includes('class="diagram"')
  
  console.log('📦 Présence wrapper:', hasWrapper ? 'OUI ⚠️' : 'NON ✅')
  
  if (!hasWrapper) {
    console.log('✅ Structure minimaliste: #app contient directement le SVG')
  }
  
  await page.screenshot({ path: 'test-minimal-puml-standalone.png', fullPage: true })
})
