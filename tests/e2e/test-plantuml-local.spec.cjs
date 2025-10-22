// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Test PlantUML avec build local', () => {
  test('doit charger index, naviguer vers .puml et afficher SVG', async ({ page }) => {
    // Capturer les erreurs console
    const consoleMessages = []
    const errors = []
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // 1. Charger la page de test
    await page.goto('http://localhost:8888/test-feature-plantuml.html')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    console.log('\n📋 Messages console:')
    consoleMessages.forEach(msg => console.log(`  ${msg}`))
    
    if (errors.length > 0) {
      console.log('\n❌ Erreurs JavaScript:')
      errors.forEach(err => console.log(`  ${err}`))
    }

    // 2. Vérifier que OntoWave a chargé
    const appDiv = await page.locator('#app').count()
    console.log(`\n✅ Div #app présent: ${appDiv > 0}`)

    // 3. Prendre screenshot initial
    await page.screenshot({ 
      path: `test-plantuml-local-index-${Date.now()}.png`,
      fullPage: true 
    })

    // 4. Attendre que le markdown se charge
    await page.waitForTimeout(2000)

    // 5. Chercher le lien vers architecture.puml
    const pumlLink = await page.locator('a[href*="architecture.puml"]').count()
    console.log(`📊 Lien PlantUML trouvé: ${pumlLink > 0}`)

    if (pumlLink > 0) {
      // 6. Cliquer sur le lien
      await page.click('a[href*="architecture.puml"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // 7. Vérifier présence SVG
      const svgCount = await page.locator('svg').count()
      console.log(`🎨 Nombre de SVG: ${svgCount}`)

      // 8. Screenshot final
      await page.screenshot({ 
        path: `test-plantuml-local-diagram-${Date.now()}.png`,
        fullPage: true 
      })

      // 9. Vérifier contenu SVG
      if (svgCount > 0) {
        const svgContent = await page.locator('svg').first().innerHTML()
        console.log(`📏 Taille contenu SVG: ${svgContent.length} caractères`)
        
        // Chercher des erreurs dans le SVG
        if (svgContent.includes('error') || svgContent.includes('Error')) {
          console.log('⚠️  Le SVG contient le mot "error"')
        } else {
          console.log('✅ Pas de mot "error" dans le SVG')
        }
      }

      expect(svgCount).toBeGreaterThan(0)
    }

    // Rapport final
    console.log('\n📊 Résumé:')
    console.log(`  - Console messages: ${consoleMessages.length}`)
    console.log(`  - Erreurs JS: ${errors.length}`)
    console.log(`  - Test: ${errors.length === 0 ? '✅ SUCCÈS' : '❌ ÉCHEC'}`)
  })
})
