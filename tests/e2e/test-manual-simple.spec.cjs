/**
 * Test ULTRA SIMPLE : Vérifier que le serveur répond
 * STRATÉGIE NOUVELLE : Pas de complexité, juste les bases
 */

const { test, expect } = require('@playwright/test')

test.describe('Test Manuel Simple', () => {
  test('1. Serveur répond sur index.html', async ({ page }) => {
    console.log('🔍 Test 1: Chargement index.html...')
    
    const response = await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    })
    
    console.log('✅ Status:', response.status())
    expect(response.status()).toBe(200)
  })

  test('2. PlantUML plugin chargé', async ({ page }) => {
    console.log('🔍 Test 2: Vérifier que le plugin PlantUML est chargé...')
    
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
    
    // Attendre que window.OntoWave existe
    await page.waitForFunction(() => typeof window.OntoWave !== 'undefined', { timeout: 5000 })
    
    console.log('✅ OntoWave chargé')
  })

  test('3. Navigation vers architecture.puml', async ({ page }) => {
    console.log('🔍 Test 3: Naviguer vers architecture.puml...')
    
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000) // Laisser OntoWave s'initialiser
    
    // Changer le hash pour pointer vers architecture.puml
    await page.evaluate(() => {
      window.location.hash = '#architecture.puml'
    })
    
    await page.waitForTimeout(3000) // Laisser le temps au rendu
    
    // Vérifier qu'il y a du contenu dans #app
    const appContent = await page.locator('#app').textContent()
    console.log('📄 Contenu #app longueur:', appContent?.length || 0)
    
    // Chercher un SVG (rendu PlantUML)
    const svgCount = await page.locator('svg').count()
    console.log('🎨 Nombre de SVG:', svgCount)
    
    expect(svgCount).toBeGreaterThan(0)
    console.log('✅ PlantUML rendu avec succès !')
  })
})
