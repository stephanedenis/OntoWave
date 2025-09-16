#!/usr/bin/env python3

"""
Test script to verify the PlantUML and Prism fixes work correctly.
This script manually tests both features to ensure they render properly.
"""

import os
import time
from playwright.sync_api import sync_playwright, expect
import tempfile

# Configuration
BASE_URL = "http://localhost:8081"

def create_test_content():
    """Create a test HTML file with both PlantUML and Prism content"""
    html_content = '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OntoWave Test - PlantUML & Prism Fix</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; }
        h2 { color: #333; }
    </style>
</head>
<body>
    <h1>Test des correctifs PlantUML et Prism</h1>
    
    <div class="test-section">
        <h2>Test 1: PlantUML avec compression DEFLATE</h2>
        <pre><code class="language-plantuml">
@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi there!
@enduml
        </code></pre>
    </div>

    <div class="test-section">
        <h2>Test 2: Prism HTML avec échappement</h2>
        <pre><code class="language-html">
&lt;div class="example"&gt;
    &lt;h3&gt;Hello World&lt;/h3&gt;
    &lt;p&gt;This HTML should be syntax highlighted.&lt;/p&gt;
&lt;/div&gt;
        </code></pre>
    </div>

    <div class="test-section">
        <h2>Test 3: Markdown avec les deux fonctionnalités</h2>
        <div id="markdown-container"></div>
    </div>

    <script src="dist/ontowave.js"></script>
    <script>
        async function testBothFeatures() {
            console.log('🧪 Starting comprehensive test...');
            
            const ontowave = new OntoWave();
            await ontowave.init();
            
            // Test markdown content with both features
            const markdownContent = `
## Test PlantUML et Prism

### PlantUML Test:
\`\`\`plantuml
@startuml
participant Alice
participant Bob
Alice -> Bob: Authentication Request
Bob -> Alice: Authentication Response
@enduml
\`\`\`

### Prism HTML Test:
\`\`\`html
<div class="container">
    <h1>Hello World</h1>
    <p>This should be highlighted</p>
</div>
\`\`\`
            `;
            
            const container = document.getElementById('markdown-container');
            const renderedHTML = await ontowave.renderMarkdown(markdownContent);
            container.innerHTML = renderedHTML;
            
            console.log('✅ Markdown rendered with both features');
            
            // Check results
            setTimeout(() => {
                const prismTokens = document.querySelectorAll('.token');
                const plantUMLImages = document.querySelectorAll('img[src*="plantuml.com"], .diagram img');
                
                console.log(`📊 Results:`);
                console.log(`  - Prism tokens found: ${prismTokens.length}`);
                console.log(`  - PlantUML images found: ${plantUMLImages.length}`);
                
                // Add visual indicators
                if (prismTokens.length > 0) {
                    console.log('✅ Prism HTML highlighting working');
                } else {
                    console.log('❌ Prism HTML highlighting failed');
                }
                
                if (plantUMLImages.length > 0) {
                    console.log('✅ PlantUML rendering working');
                    plantUMLImages.forEach((img, i) => {
                        console.log(`  PlantUML ${i+1} src: ${img.src.substring(0, 100)}...`);
                    });
                } else {
                    console.log('❌ PlantUML rendering failed');
                }
            }, 3000);
        }
        
        // Run tests when page loads
        window.addEventListener('load', testBothFeatures);
    </script>
</body>
</html>'''
    
    return html_content

def test_with_playwright():
    """Test using Playwright automation"""
    print("🎭 Starting Playwright test...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Enable console logging
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        
        # Navigate to test page
        page.goto(f"{BASE_URL}/test_fix_verification.html")
        
        # Wait for OntoWave to load and process
        page.wait_for_timeout(5000)
        
        # Check Prism tokens
        prism_tokens = page.locator('.token')
        prism_count = prism_tokens.count()
        print(f"📊 Prism tokens found: {prism_count}")
        
        # Check PlantUML images
        plantuml_images = page.locator('img[src*="plantuml.com"], .diagram img')
        plantuml_count = plantuml_images.count()
        print(f"📊 PlantUML images found: {plantuml_count}")
        
        # Take screenshot for visual verification
        page.screenshot(path="test_results.png")
        print("📸 Screenshot saved as test_results.png")
        
        browser.close()
        
        return prism_count, plantuml_count

def main():
    print("🔧 Testing PlantUML DEFLATE compression and Prism HTML escaping fixes...")
    
    # Create test HTML file
    print("📝 Creating test HTML file...")
    test_content = create_test_content()
    
    with open("/home/stephane/GitHub/OntoWave/test_fix_verification.html", "w", encoding="utf-8") as f:
        f.write(test_content)
    
    print(f"✅ Test file created: {BASE_URL}/test_fix_verification.html")
    
    # Test with Playwright
    try:
        prism_count, plantuml_count = test_with_playwright()
        
        print("\n" + "="*50)
        print("📋 TEST RESULTS SUMMARY")
        print("="*50)
        
        if prism_count > 0:
            print("✅ Prism HTML escaping: WORKING")
            print(f"   → {prism_count} syntax tokens found")
        else:
            print("❌ Prism HTML escaping: FAILED")
            print("   → No syntax highlighting tokens found")
        
        if plantuml_count > 0:
            print("✅ PlantUML DEFLATE compression: WORKING")
            print(f"   → {plantuml_count} diagrams rendered")
        else:
            print("❌ PlantUML DEFLATE compression: FAILED")
            print("   → No PlantUML diagrams found")
        
        if prism_count > 0 and plantuml_count > 0:
            print("\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!")
        else:
            print("\n⚠️  Some fixes may need additional work")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
