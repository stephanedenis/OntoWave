// @ts-check
const { test, expect } = require('@playwright/test')

test('Diagnostic COMPLET - OntoWave page blanche', async ({ page }) => {
  console.log('\n🔍 ===== DÉMARRAGE DIAGNOSTIC COMPLET =====\n')
  
  // Tableaux pour stocker tous les événements
  const consoleMessages = []
  const consoleErrors = []
  const consoleWarnings = []
  const networkErrors = []
  const jsErrors = []
  
  // Capturer TOUS les messages console
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location()
    
    const fullMessage = `[${type.toUpperCase()}] ${text} (${location.url}:${location.lineNumber})`
    
    consoleMessages.push(fullMessage)
    
    if (type === 'error') {
      consoleErrors.push(fullMessage)
      console.log(`❌ ${fullMessage}`)
    } else if (type === 'warning') {
      consoleWarnings.push(fullMessage)
      console.log(`⚠️  ${fullMessage}`)
    } else {
      console.log(`ℹ️  ${fullMessage}`)
    }
  })
  
  // Capturer les erreurs JavaScript
  page.on('pageerror', error => {
    const errMsg = `JS ERROR: ${error.message}\nStack: ${error.stack}`
    jsErrors.push(errMsg)
    console.log(`💥 ${errMsg}`)
  })
  
  // Capturer les requêtes échouées
  page.on('requestfailed', request => {
    const failure = request.failure()
    const errMsg = `${request.url()} - ${failure ? failure.errorText : 'unknown error'}`
    networkErrors.push(errMsg)
    console.log(`🌐❌ REQUEST FAILED: ${errMsg}`)
  })
  
  // Capturer toutes les réponses HTTP
  page.on('response', response => {
    const url = response.url()
    const status = response.status()
    const statusText = response.statusText()
    
    if (status >= 400) {
      console.log(`🌐 ${status} ${statusText} - ${url}`)
    } else if (url.includes('.js') || url.includes('.md') || url.includes('.puml')) {
      console.log(`🌐 ${status} ${url.split('/').pop()}`)
    }
  })
  
  console.log('\n🌐 Navigation vers http://localhost:8000/#/index.md\n')
  
  try {
    await page.goto('http://localhost:8000/#/index.md', {
      waitUntil: 'networkidle',
      timeout: 15000
    })
  } catch (error) {
    console.log(`⚠️  Navigation error: ${error.message}`)
  }
  
  console.log('\n⏱️  Attente de 5 secondes pour l\'initialisation...\n')
  await page.waitForTimeout(5000)
  
  // Récupérer les informations de la page
  const title = await page.title()
  const url = page.url()
  
  console.log('\n📄 ===== INFORMATIONS PAGE =====')
  console.log(`Titre: "${title}"`)
  console.log(`URL: ${url}`)
  
  // Vérifier le HTML body
  const bodyHTML = await page.evaluate(() => document.body.innerHTML)
  console.log(`\n📝 Longueur HTML body: ${bodyHTML.length} caractères`)
  
  if (bodyHTML.length < 200) {
    console.log(`📝 Body complet:\n${bodyHTML}`)
  } else {
    console.log(`📝 Aperçu body (300 premiers caractères):\n${bodyHTML.substring(0, 300)}...`)
  }
  
  // Vérifier le contenu du div#app
  const appContent = await page.evaluate(() => {
    const app = document.getElementById('app')
    return app ? app.innerHTML : null
  })
  
  console.log(`\n📦 Contenu #app: ${appContent ? appContent.length + ' caractères' : 'VIDE OU INEXISTANT'}`)
  if (appContent && appContent.length < 200) {
    console.log(`📦 #app innerHTML:\n${appContent}`)
  } else if (appContent) {
    console.log(`📦 #app aperçu:\n${appContent.substring(0, 300)}...`)
  }
  
  // Compter les éléments
  const h1Count = await page.locator('h1').count()
  const linkCount = await page.locator('a').count()
  const svgCount = await page.locator('svg').count()
  
  console.log(`\n📊 Éléments trouvés:`)
  console.log(`   H1: ${h1Count}`)
  console.log(`   Liens: ${linkCount}`)
  console.log(`   SVG: ${svgCount}`)
  
  // Vérifier si des scripts ont chargé
  const scriptsLoaded = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    return scripts.map(s => ({
      src: s.getAttribute('src'),
      loaded: s.complete !== undefined ? s.complete : 'unknown'
    }))
  })
  
  console.log(`\n📜 Scripts chargés: ${scriptsLoaded.length}`)
  scriptsLoaded.forEach(s => {
    console.log(`   ${s.loaded === true ? '✅' : s.loaded === false ? '❌' : '❓'} ${s.src}`)
  })
  
  // Vérifier les variables globales OntoWave
  const ontoWaveGlobals = await page.evaluate(() => {
    const win = window
    return {
      __ONTOWAVE_BUNDLE__: typeof win.__ONTOWAVE_BUNDLE__ !== 'undefined',
      ontowave: typeof win.ontowave !== 'undefined',
      owApp: typeof win.owApp !== 'undefined',
    }
  })
  
  console.log(`\n🔧 Variables globales OntoWave:`)
  console.log(`   __ONTOWAVE_BUNDLE__: ${ontoWaveGlobals.__ONTOWAVE_BUNDLE__ ? '✅' : '❌'}`)
  console.log(`   window.ontowave: ${ontoWaveGlobals.ontowave ? '✅' : '❌'}`)
  console.log(`   window.owApp: ${ontoWaveGlobals.owApp ? '✅' : '❌'}`)
  
  // Screenshots
  const timestamp = Date.now()
  const screenshotPath = `diagnostic-complet-${timestamp}.png`
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`\n📸 Screenshot sauvegardé: ${screenshotPath}`)
  
  // Résumé des erreurs
  console.log('\n\n🔴 ===== RÉSUMÉ DES ERREURS =====')
  console.log(`\nErreurs JavaScript: ${jsErrors.length}`)
  jsErrors.forEach(err => console.log(`   💥 ${err.split('\n')[0]}`))
  
  console.log(`\nErreurs Console: ${consoleErrors.length}`)
  consoleErrors.forEach(err => console.log(`   ❌ ${err}`))
  
  console.log(`\nAvertissements Console: ${consoleWarnings.length}`)
  consoleWarnings.forEach(warn => console.log(`   ⚠️  ${warn}`))
  
  console.log(`\nErreurs Réseau: ${networkErrors.length}`)
  networkErrors.forEach(err => console.log(`   🌐 ${err}`))
  
  console.log(`\nTotal messages console: ${consoleMessages.length}`)
  
  // Diagnostic final
  console.log('\n\n🎯 ===== DIAGNOSTIC FINAL =====')
  
  if (appContent && appContent.length > 50) {
    console.log('✅ OntoWave semble avoir démarré (#app non vide)')
  } else {
    console.log('❌ OntoWave N\'A PAS démarré (#app vide)')
    console.log('\n🔍 Causes possibles:')
    if (jsErrors.length > 0) {
      console.log('   - Erreur JavaScript critique empêche l\'initialisation')
    }
    if (networkErrors.length > 0) {
      console.log('   - Ressources manquantes (JS, MD, etc.)')
    }
    if (!ontoWaveGlobals.__ONTOWAVE_BUNDLE__) {
      console.log('   - Bundle OntoWave non chargé correctement')
    }
  }
  
  console.log('\n🔍 ===== FIN DIAGNOSTIC COMPLET =====\n')
  
  // Le test passe toujours (diagnostic only)
  expect(true).toBe(true)
})
