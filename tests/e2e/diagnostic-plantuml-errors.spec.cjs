// @ts-check
const { test, expect } = require('@playwright/test')

test('Diagnostic PlantUML - Capture des erreurs', async ({ page }) => {
  console.log('\n🔍 DIAGNOSTIC ERREURS PLANTUML\n')
  
  const consoleErrors = []
  const consoleWarnings = []
  const jsErrors = []
  
  // Capturer TOUS les messages
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location()
    
    if (type === 'error') {
      consoleErrors.push(`${text} (${location.url}:${location.lineNumber})`)
      console.log(`❌ [ERROR] ${text}`)
    } else if (type === 'warning') {
      consoleWarnings.push(`${text} (${location.url}:${location.lineNumber})`)
      console.log(`⚠️  [WARNING] ${text}`)
    } else if (text.toLowerCase().includes('plantuml')) {
      console.log(`ℹ️  [PLANTUML] ${text}`)
    }
  })
  
  // Capturer les erreurs JavaScript
  page.on('pageerror', error => {
    jsErrors.push(error.message)
    console.log(`💥 JS ERROR: ${error.message}`)
  })
  
  console.log('📄 Étape 1: Charger index.md')
  await page.goto('http://localhost:8000/#/index.md', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  
  console.log('\n🎨 Étape 2: Charger architecture.puml')
  await page.goto('http://localhost:8000/#/architecture.puml', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  
  // Vérifier le contenu
  const svgCount = await page.locator('svg').count()
  const appContent = await page.locator('#app').innerHTML()
  
  console.log(`\n📊 Résultats:`)
  console.log(`   SVG trouvés: ${svgCount}`)
  console.log(`   Contenu #app: ${appContent.length} caractères`)
  
  // Chercher "error" dans le contenu
  const hasErrorInContent = appContent.toLowerCase().includes('error')
  const hasPlantUMLError = appContent.toLowerCase().includes('plantuml') && appContent.toLowerCase().includes('error')
  
  if (hasErrorInContent) {
    console.log(`   ⚠️  Le mot "error" est présent dans le contenu`)
  }
  
  if (hasPlantUMLError) {
    console.log(`   ❌ Erreur PlantUML détectée dans le contenu !`)
    // Extraire le message d'erreur
    const errorMatch = appContent.match(/error[^<]*/gi)
    if (errorMatch) {
      console.log(`   Message: ${errorMatch[0].substring(0, 200)}`)
    }
  }
  
  // Screenshot
  await page.screenshot({ path: `diagnostic-plantuml-${Date.now()}.png`, fullPage: true })
  console.log(`\n📸 Screenshot sauvegardé`)
  
  console.log(`\n🔴 Erreurs capturées:`)
  console.log(`   Erreurs Console: ${consoleErrors.length}`)
  consoleErrors.forEach(err => console.log(`     - ${err.substring(0, 100)}`))
  
  console.log(`   Avertissements: ${consoleWarnings.length}`)
  consoleWarnings.forEach(warn => console.log(`     - ${warn.substring(0, 100)}`))
  
  console.log(`   Erreurs JS: ${jsErrors.length}`)
  jsErrors.forEach(err => console.log(`     - ${err.substring(0, 100)}`))
  
  // Le test passe toujours (diagnostic only)
  expect(true).toBe(true)
})
