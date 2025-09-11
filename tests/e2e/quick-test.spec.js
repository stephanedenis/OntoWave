import { test, expect } from "@playwright/test";

test("Test rapide - OntoWave se charge", async ({ page }) => {
  console.log("🧪 Test rapide: Chargement OntoWave...");
  
  await page.goto("http://localhost:8080");
  await page.waitForLoadState("networkidle");
  
  // Vérifier le titre
  await expect(page).toHaveTitle(/OntoWave/);
  
  // Vérifier que les boutons de langue existent  
  const frButton = page.locator("#btn-fr");
  const enButton = page.locator("#btn-en");
  
  await expect(frButton).toBeVisible();
  await expect(enButton).toBeVisible();
  
  console.log("✅ OntoWave chargé avec boutons de langue");
});
