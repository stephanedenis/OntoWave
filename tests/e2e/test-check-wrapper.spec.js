import { test } from '@playwright/test'

test('Vérifier wrapper sans style', async ({ page }) => {
  await page.goto('http://localhost:8000/#architecture.puml', { timeout: 10000 })
  await page.waitForSelector('#app', { timeout: 15000 })
  await page.waitForTimeout(2000)
  
  // Récupérer le HTML du wrapper
  const wrapperHTML = await page.locator('.plantuml-diagram-wrapper').first().evaluate(el => el.outerHTML.substring(0, 300))
  console.log('🔍 Wrapper HTML:', wrapperHTML)
  
  // Vérifier qu'il n'y a PAS de style inline sur le wrapper
  const wrapperStyle = await page.locator('.plantuml-diagram-wrapper').first().getAttribute('style')
  console.log('🎨 Wrapper style attribute:', wrapperStyle || '(none)')
  
  if (!wrapperStyle) {
    console.log('✅ Aucun style inline - parfait!')
  } else {
    console.log('⚠️  Style inline trouvé:', wrapperStyle)
  }
})
