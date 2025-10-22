import { test, expect } from '@playwright/test'

test('PlantUML sur port 8000', async ({ page }) => {
  // Capturer les requêtes réseau
  const requests = []
  page.on('request', req => {
    requests.push(req.url())
  })
  
  // Aller directement sur localhost:8000
  await page.goto('http://localhost:8000/#architecture.puml', { timeout: 10000 })
  
  // Attendre que #app soit visible et rempli
  await page.waitForSelector('#app', { timeout: 15000 })
  
  // Attendre un peu pour le chargement async
  await page.waitForTimeout(2000)
  
  // Vérifier le contenu
  const appContent = await page.locator('#app').innerHTML()
  console.log('📄 App content length:', appContent.length)
  console.log('📄 First 200 chars:', appContent.substring(0, 200))
  
  // Chercher un SVG
  const svgCount = await page.locator('svg').count()
  console.log('🎨 SVG elements found:', svgCount)
  
  if (svgCount > 0) {
    const svg = await page.locator('svg').first()
    const isVisible = await svg.isVisible()
    console.log('✅ Premier SVG visible:', isVisible)
  } else {
    console.log('❌ Aucun SVG trouvé - affichage code brut?')
  }
  
  // Vérifier les URLs PlantUML
  const plantUMLRequests = requests.filter(url => url.includes('plantuml'))
  console.log('🌐 PlantUML requests:', plantUMLRequests.length)
  
  if (plantUMLRequests.length > 0) {
    console.log('🔗 First PlantUML URL:', plantUMLRequests[0].substring(0, 100) + '...')
    // Vérifier le préfixe ~0 (DEFLATE)
    const has_tilde0 = plantUMLRequests.some(url => url.includes('/svg/~0'))
    console.log('✓ URL avec préfixe ~0 (DEFLATE):', has_tilde0)
  }
  
  // Screenshot
  await page.screenshot({ path: 'test-port8000.png', fullPage: true })
})
