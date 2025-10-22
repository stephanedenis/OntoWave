import { test, expect } from '@playwright/test'

test('PlantUML rendering test', async ({ page }) => {
  // Capturer les requêtes réseau
  const requests = []
  page.on('request', req => {
    requests.push(req.url())
  })
  
  // Aller sur la page de test
  await page.goto('/test-simple.html', { timeout: 10000 })
  
  // Attendre que #app soit rempli
  await page.waitForSelector('#app', { timeout: 15000 })
  
  // Vérifier que le contenu PlantUML est chargé
  const appContent = await page.locator('#app').innerHTML()
  console.log('📄 App content length:', appContent.length)
  
  // Attendre un SVG PlantUML (peut prendre du temps)
  const svg = await page.locator('svg').first()
  await expect(svg).toBeVisible({ timeout: 20000 })
  
  console.log('✅ SVG PlantUML trouvé et visible')
  
  // Vérifier les URLs PlantUML
  const plantUMLRequests = requests.filter(url => url.includes('plantuml'))
  console.log('🌐 PlantUML requests:', plantUMLRequests.length)
  
  if (plantUMLRequests.length > 0) {
    console.log('🔗 First PlantUML URL:', plantUMLRequests[0])
    // Vérifier le préfixe ~1
    const has_tilde1 = plantUMLRequests.some(url => url.includes('/svg/~1'))
    console.log('✓ URL avec préfixe ~1:', has_tilde1)
  }
  
  // Screenshot
  await page.screenshot({ path: 'test-results/plantuml-render.png', fullPage: true })
})
