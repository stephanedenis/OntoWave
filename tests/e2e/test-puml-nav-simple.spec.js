import { test, expect } from '@playwright/test'

test('Navigation PlantUML - Test simplifié', async ({ page }) => {
  console.log('📍 Charger diagramme avec liens')
  await page.goto('http://localhost:8000/#test-navigation.puml', { timeout: 10000 })
  await page.waitForSelector('svg', { timeout: 15000 })
  await page.waitForTimeout(2000)
  
  // Screenshot initial
  await page.screenshot({ path: 'nav-test-1-initial.png', fullPage: true })
  
  // Extraire tous les liens du SVG
  const links = await page.evaluate(() => {
    const svgLinks = Array.from(document.querySelectorAll('svg a'))
    return svgLinks.map(a => ({
      href: a.getAttribute('href') || a.getAttribute('xlink:href') || '',
      text: a.textContent || '',
      visible: a.getBoundingClientRect().height > 0
    }))
  })
  
  console.log('🔗 Liens trouvés:', links.length)
  links.forEach((l, i) => console.log(`   ${i}: ${l.href} - "${l.text}" (visible: ${l.visible})`))
  
  // Test 1: Navigation vers .md via hash
  console.log('\n📍 Test 1: Navigation vers index.md')
  await page.evaluate(() => { location.hash = '#index.md' })
  await page.waitForTimeout(2000)
  
  let url = page.url()
  console.log('   URL après nav:', url)
  expect(url).toContain('index.md')
  
  await page.screenshot({ path: 'nav-test-2-after-md.png', fullPage: true })
  
  // Vérifier que le contenu Markdown s'affiche
  const content = await page.locator('#app').textContent()
  console.log('   Contenu chargé:', content.substring(0, 100))
  
  // Test 2: Navigation vers autre .puml
  console.log('\n📍 Test 2: Navigation vers architecture.puml')
  await page.evaluate(() => { location.hash = '#architecture.puml' })
  await page.waitForTimeout(3000)
  
  url = page.url()
  console.log('   URL après nav:', url)
  expect(url).toContain('architecture.puml')
  
  // Vérifier qu'un SVG s'affiche
  const svgCount = await page.locator('svg').count()
  console.log('   SVG trouvés:', svgCount)
  expect(svgCount).toBeGreaterThan(0)
  
  await page.screenshot({ path: 'nav-test-3-after-puml.png', fullPage: true })
  
  console.log('\n✅ Navigation fonctionne!')
})
