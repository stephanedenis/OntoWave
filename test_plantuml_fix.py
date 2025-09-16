from playwright.sync_api import sync_playwright
import time

def test_plantuml_fixed():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Go to OntoWave site
        page.goto("http://localhost:8080")
        
        # Wait for page to load
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        
        # Look for PlantUML images
        plantuml_images = page.locator('img[src*="plantuml"]')
        count = plantuml_images.count()
        print(f"Found {count} PlantUML images")
        
        if count > 0:
            # Check first PlantUML image
            first_image = plantuml_images.nth(0)
            src = first_image.get_attribute('src')
            print(f"First PlantUML URL: {src}")
            
            # Navigate to the image URL to verify it's not an error
            page.goto(src)
            page_content = page.content()
            
            if "HUFFMAN" in page_content or "bad URL" in page_content:
                print("❌ ERROR: PlantUML still shows HUFFMAN error!")
            elif "<svg" in page_content:
                print("✅ SUCCESS: PlantUML returns valid SVG!")
            else:
                print(f"? Unknown response: {page_content[:200]}...")
        else:
            print("No PlantUML images found")
        
        browser.close()

if __name__ == "__main__":
    test_plantuml_fixed()
