// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Diagnostic build local OntoWave', () => {
  test('doit diagnostiquer le chargement complet', async ({ page }) => {
    // Capturer TOUS les messages console
    const consoleMessages = []
    const errors = []
    const warnings = []
    const networkRequests = []
    
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      if (msg.type() === 'error') {
        errors.push(text)
      } else if (msg.type() === 'warning') {
        warnings.push(text)
      }
    })
    
    page.on('pageerror', error => {
      errors.push(`PAGEERROR: ${error.message}`)
    })

    page.on('request', request => {
      networkRequests.push(`→ ${request.method()} ${request.url()}`)
    })

    page.on('response', response => {
      networkRequests.push(`← ${response.status()} ${response.url()}`)
    })

    // 1. Charger la page de test
    console.log('\n🔍 CHARGEMENT DE LA PAGE...')
    try {
      await page.goto('http://localhost:8888/test-feature-plantuml.html', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })
    } catch (err) {
      console.log(`❌ Erreur de chargement: ${err.message}`)
    }

    await page.waitForTimeout(3000)

    // 2. Afficher tous les messages console
    console.log('\n📋 MESSAGES CONSOLE (' + consoleMessages.length + ' messages):')
    consoleMessages.forEach(msg => console.log(`  ${msg}`))
    
    if (errors.length > 0) {
      console.log('\n❌ ERREURS JAVASCRIPT (' + errors.length + '):')
      errors.forEach(err => console.log(`  ${err}`))
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (' + warnings.length + '):')
      warnings.forEach(warn => console.log(`  ${warn}`))
    }

    // 3. Vérifier le DOM
    console.log('\n🔍 ANALYSE DU DOM:')
    const bodyHTML = await page.locator('body').innerHTML()
    console.log(`  Body HTML length: ${bodyHTML.length} caractères`)
    
    const appDiv = await page.locator('#app').count()
    console.log(`  #app présent: ${appDiv > 0}`)
    
    if (appDiv > 0) {
      const appContent = await page.locator('#app').innerHTML()
      console.log(`  #app content length: ${appContent.length}`)
      console.log(`  #app first 200 chars: ${appContent.substring(0, 200)}`)
    }

    const allDivs = await page.locator('div').count()
    console.log(`  Nombre total de <div>: ${allDivs}`)

    // 4. Vérifier les scripts
    const scripts = await page.locator('script').count()
    console.log(`  Nombre de <script>: ${scripts}`)

    // 5. Réseau
    console.log('\n🌐 REQUÊTES RÉSEAU (' + networkRequests.length + '):')
    networkRequests.forEach(req => console.log(`  ${req}`))

    // 6. Screenshot
    await page.screenshot({ 
      path: `diagnostic-build-local-${Date.now()}.png`,
      fullPage: true 
    })
    console.log('\n📸 Screenshot sauvegardé')

    // 7. Vérifier window.OntoWave
    const hasOntoWave = await page.evaluate(() => {
      return typeof window.OntoWave !== 'undefined'
    })
    console.log(`\n🌊 window.OntoWave existe: ${hasOntoWave}`)

    if (hasOntoWave) {
      const ontoWaveProps = await page.evaluate(() => {
        return Object.keys(window.OntoWave || {})
      })
      console.log(`  Propriétés OntoWave: ${ontoWaveProps.join(', ')}`)
    }

    // 8. Résumé
    console.log('\n📊 RÉSUMÉ:')
    console.log(`  - Messages console: ${consoleMessages.length}`)
    console.log(`  - Erreurs JS: ${errors.length}`)
    console.log(`  - Warnings: ${warnings.length}`)
    console.log(`  - Requêtes réseau: ${networkRequests.length}`)
    console.log(`  - #app présent: ${appDiv > 0}`)
    console.log(`  - OntoWave chargé: ${hasOntoWave}`)
  })
})
