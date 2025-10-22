const { test, expect } = require('@playwright/test')

test.describe('PlantUML rendering with HUFFMAN encoding (~1 prefix)', () => {
  test.use({ baseURL: 'http://localhost:5174' })

  test('should render PlantUML diagram with correct URL encoding', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()))
    
    // Navigate to PlantUML test file
    await page.goto('/#test-plantuml.puml')
    
    // Wait for OntoWave to initialize
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Give time for PlantUML fetch
    
    // Check if SVG diagram is rendered
    const svgExists = await page.locator('svg').count() > 0
    console.log('✅ SVG diagram present:', svgExists)
    
    // Check if error message is displayed
    const errorMessage = await page.locator('text=Erreur').count()
    console.log('❌ Error messages:', errorMessage)
    
    // Get PlantUML URL from network requests
    const plantUMLRequests = []
    page.on('request', request => {
      if (request.url().includes('plantuml.com')) {
        plantUMLRequests.push(request.url())
        console.log('🔗 PlantUML URL:', request.url())
      }
    })
    
    // Reload to capture network requests
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Verify URL contains ~1 prefix for HUFFMAN encoding
    const hasCorrectPrefix = plantUMLRequests.some(url => url.includes('/svg/~1'))
    console.log('✅ Correct ~1 prefix:', hasCorrectPrefix)
    
    expect(hasCorrectPrefix).toBeTruthy()
    expect(svgExists).toBeTruthy()
    expect(errorMessage).toBe(0)
  })
})
