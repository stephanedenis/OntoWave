import { test, expect } from '@playwright/test'

test('Vérifier que tous les liens référencés existent', async ({ page }) => {
  // Liste des fichiers référencés dans test-navigation.puml
  const files = [
    'test-plantuml.puml',
    'index.md',
    'architecture.puml',
    'test-navigation.puml',
    'test-target.md'
  ]
  
  console.log('🔍 Vérification des fichiers...\n')
  
  for (const file of files) {
    const url = `http://localhost:8000/${file}`
    const response = await page.request.get(url)
    const status = response.status()
    
    if (status === 200) {
      console.log(`✅ ${file}: ${status}`)
    } else {
      console.log(`❌ ${file}: ${status}`)
    }
    
    expect(status).toBe(200)
  }
  
  console.log('\n✅ Tous les fichiers sont accessibles!')
})

test('Tester navigation via hash', async ({ page }) => {
  console.log('\n📍 Test navigation via hash...')
  
  // Test 1: Navigation vers test-navigation.puml
  console.log('1. Navigation vers test-navigation.puml')
  await page.goto('http://localhost:8000/#test-navigation.puml', { timeout: 10000 })
  await page.waitForTimeout(3000)
  
  const svg1 = await page.locator('svg').count()
  console.log(`   SVG trouvés: ${svg1}`)
  expect(svg1).toBeGreaterThan(0)
  
  // Test 2: Navigation vers index.md
  console.log('2. Navigation vers index.md')
  await page.goto('http://localhost:8000/#index.md', { timeout: 10000 })
  await page.waitForTimeout(2000)
  
  const content = await page.locator('#app').textContent()
  console.log(`   Contenu chargé: ${content.substring(0, 50)}...`)
  expect(content.length).toBeGreaterThan(0)
  
  // Test 3: Navigation vers architecture.puml
  console.log('3. Navigation vers architecture.puml')
  await page.goto('http://localhost:8000/#architecture.puml', { timeout: 10000 })
  await page.waitForTimeout(3000)
  
  const svg2 = await page.locator('svg').count()
  console.log(`   SVG trouvés: ${svg2}`)
  expect(svg2).toBeGreaterThan(0)
  
  // Test 4: Navigation vers test-plantuml.puml
  console.log('4. Navigation vers test-plantuml.puml')
  await page.goto('http://localhost:8000/#test-plantuml.puml', { timeout: 10000 })
  await page.waitForTimeout(3000)
  
  const svg3 = await page.locator('svg').count()
  console.log(`   SVG trouvés: ${svg3}`)
  expect(svg3).toBeGreaterThan(0)
  
  console.log('\n✅ Toutes les navigations fonctionnent!')
})
