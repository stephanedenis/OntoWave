import { test } from '@playwright/test'

test('Vérifier absence de box-shadow', async ({ page }) => {
  await page.goto('http://localhost:8000/#architecture.puml', { timeout: 10000 })
  await page.waitForSelector('#app', { timeout: 15000 })
  await page.waitForTimeout(2000)
  
  // Récupérer le style du SVG
  const svgStyle = await page.locator('svg').first().getAttribute('style')
  console.log('🎨 SVG style:', svgStyle)
  
  // Vérifier qu'il n'y a PAS de box-shadow
  if (svgStyle && svgStyle.includes('box-shadow')) {
    console.log('❌ Box-shadow trouvé:', svgStyle)
  } else {
    console.log('✅ Pas de box-shadow - intégration parfaite!')
  }
  
  // Screenshot final
  await page.screenshot({ path: 'test-no-shadow.png', fullPage: true })
})
