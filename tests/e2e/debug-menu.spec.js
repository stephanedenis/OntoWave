import { test, expect } from '@playwright/test';

test.describe('OntoWave Debug', () => {
  test('debug menu visibility', async ({ page }) => {
    await page.goto('http://localhost:8000/debug-test.html');
    
    // Attendre que OntoWave soit chargé
    await page.waitForSelector('#ontowave-floating-menu', { timeout: 15000 });
    
    console.log('Menu found');
    
    const menu = page.locator('#ontowave-floating-menu');
    const isVisible = await menu.isVisible();
    console.log('Menu is visible:', isVisible);
    
    const menuIcon = page.locator('#ontowave-menu-icon');
    const iconVisible = await menuIcon.isVisible();
    console.log('Menu icon is visible:', iconVisible);
    
    if (iconVisible) {
      await menuIcon.click();
      await page.waitForTimeout(500);
      
      const menuClasses = await menu.getAttribute('class');
      console.log('Menu classes:', menuClasses);
      
      const menuContent = page.locator('.ontowave-menu-content');
      const contentVisible = await menuContent.isVisible();
      console.log('Menu content is visible after click:', contentVisible);
      
      const brand = page.locator('.ontowave-menu-brand');
      const brandVisible = await brand.isVisible();
      console.log('Brand is visible:', brandVisible);
      
      const brandExists = await brand.count();
      console.log('Brand count:', brandExists);
      
      if (brandExists > 0) {
        const brandText = await brand.textContent();
        console.log('Brand text:', brandText);
        
        const brandStyles = await brand.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            opacity: styles.opacity,
            display: styles.display,
            visibility: styles.visibility,
            fontSize: styles.fontSize,
            color: styles.color,
            position: styles.position
          };
        });
        console.log('Brand computed styles:', brandStyles);
        
        // Tester le sélecteur CSS
        const brandByCSS = await page.evaluate(() => {
          const el = document.querySelector('.ontowave-menu-brand');
          return el ? {
            exists: true,
            visible: el.offsetParent !== null,
            text: el.textContent,
            rect: el.getBoundingClientRect()
          } : { exists: false };
        });
        console.log('Brand by CSS selector:', brandByCSS);
      }
      
      // Vérifier s'il y a des transitions CSS
      const menuStyles = await menu.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          opacity: styles.opacity,
          width: styles.width,
          display: styles.display
        };
      });
      console.log('Menu computed styles:', menuStyles);
      
      const contentStyles = await menuContent.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          opacity: styles.opacity,
          width: styles.width,
          display: styles.display
        };
      });
      console.log('Content computed styles:', contentStyles);
    }
  });
});
