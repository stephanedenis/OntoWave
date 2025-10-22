// @ts-check
const { test, expect } = require('@playwright/test')

test('Diagnostic PlantUML sans config.json', async ({ page }) => {
  console.log('🔍 Démarrage du diagnostic OntoWave sans config.json...')
  
  // Capturer TOUS les messages console
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'info' ? 'ℹ️' : '📝'
    console.log(`${prefix} [${type}] ${text}`)
  })

  // Capturer les erreurs de requêtes
  page.on('requestfailed', request => {
    const failure = request.failure()
    const info = `${request.url()} - ${failure ? failure.errorText : 'unknown'}`
    console.log(`❌ REQUEST FAILED: ${info}`)
  })

  // Capturer TOUTES les requêtes
  page.on('response', response => {
    const url = response.url()
    const status = response.status()
    const shortUrl = url.split('/').pop() || url
    const emoji = status >= 400 ? '❌' : status >= 300 ? '🔄' : '✅'
    console.log(`${emoji} ${status} ${shortUrl}`)
  })

  console.log('\n🌐 Navigation vers http://localhost:8000/#/architecture.puml')
  await page.goto('http://localhost:8000/#/architecture.puml', {
    waitUntil: 'networkidle',
    timeout: 15000
  })

  console.log('⏱️  Attente de 3 secondes...')
  await page.waitForTimeout(3000)

  // Vérifier le titre
  const title = await page.title()
  console.log(`\n📄 Titre de la page: "${title}"`)

  // Vérifier le HTML body
  const bodyHTML = await page.evaluate(() => document.body.innerHTML)
  console.log(`📝 Longueur du HTML body: ${bodyHTML.length} caractères`)
  
  if (bodyHTML.length < 100) {
    console.log(`📝 Body complet: ${bodyHTML}`)
  } else {
    console.log(`📝 Aperçu body (200 premiers caractères): ${bodyHTML.substring(0, 200)}...`)
  }

  // Vérifier si SVG présent
  const svgCount = await page.locator('svg').count()
  console.log(`\n🎨 Nombre de SVG trouvés: ${svgCount}`)

  if (svgCount > 0) {
    const svgHTML = await page.locator('svg').first().evaluate(el => el.outerHTML.substring(0, 300))
    console.log(`🎨 SVG aperçu (300 premiers caractères): ${svgHTML}...`)
    
    // Vérifier si le SVG est visible
    const svgVisible = await page.locator('svg').first().isVisible()
    console.log(`�️  SVG visible: ${svgVisible}`)
  }

  // Vérifier le div principal
  const appDiv = await page.locator('#app').count()
  const pumlDiv = await page.locator('.plantuml-diagram-wrapper').count()
  console.log(`\n📦 #app trouvé: ${appDiv}`)
  console.log(`📦 .plantuml-diagram-wrapper trouvé: ${pumlDiv}`)

  // Screenshot avec timestamp
  const timestamp = Date.now()
  const screenshotPath = `diagnostic-puml-${timestamp}.png`
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`\n📸 Screenshot sauvegardé: ${screenshotPath}`)

  // Le test passe toujours (c'est juste un diagnostic)
  expect(svgCount).toBeGreaterThanOrEqual(0)
})
