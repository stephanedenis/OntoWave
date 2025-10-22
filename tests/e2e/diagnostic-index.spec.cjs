// @ts-check
const { test, expect } = require('@playwright/test')

test('Diagnostic page index.md', async ({ page }) => {
  console.log('🔍 Test de la page d\'accueil (index.md)...')
  
  // Capturer tous les messages console
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${type}] ${text}`)
  })

  // Capturer les requêtes
  page.on('response', response => {
    const url = response.url()
    const status = response.status()
    const shortUrl = url.split('/').pop() || url.substring(url.length - 30)
    const emoji = status >= 400 ? '❌' : status >= 300 ? '🔄' : '✅'
    console.log(`${emoji} ${status} ${shortUrl}`)
  })

  console.log('\n🌐 Navigation vers http://localhost:8000/ (page d\'accueil)')
  await page.goto('http://localhost:8000/', {
    waitUntil: 'networkidle',
    timeout: 15000
  })

  console.log('⏱️  Attente de 3 secondes...')
  await page.waitForTimeout(3000)

  const title = await page.title()
  console.log(`\n📄 Titre: "${title}"`)

  const bodyHTML = await page.evaluate(() => document.body.innerHTML)
  console.log(`📝 Longueur du body: ${bodyHTML.length} caractères`)

  if (bodyHTML.length < 100) {
    console.log(`📝 Body complet: ${bodyHTML}`)
  } else {
    console.log(`📝 Aperçu: ${bodyHTML.substring(0, 300)}...`)
  }

  // Vérifier le contenu markdown rendu
  const h1Count = await page.locator('h1').count()
  console.log(`\n📋 Nombre de H1: ${h1Count}`)
  
  if (h1Count > 0) {
    const h1Text = await page.locator('h1').first().textContent()
    console.log(`📋 Premier H1: "${h1Text}"`)
  }

  const linkCount = await page.locator('a').count()
  console.log(`🔗 Nombre de liens: ${linkCount}`)

  // Screenshot
  const screenshotPath = `diagnostic-index-${Date.now()}.png`
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`\n📸 Screenshot: ${screenshotPath}`)

  expect(h1Count).toBeGreaterThan(0)
})
