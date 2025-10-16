/**
 * Support pour navigation et rendu de fichiers PlantUML (.puml)
 */

export type Root = { base: string; root: string }

/**
 * Encode du texte PlantUML en UTF-8 hexadécimal pour l'API PlantUML
 */
export function encodePlantUML(text: string): string {
  const utf8Encoder = new TextEncoder()
  const utf8Bytes = utf8Encoder.encode(text)
  let hex = ''
  for (let i = 0; i < utf8Bytes.length; i++) {
    hex += utf8Bytes[i].toString(16).padStart(2, '0')
  }
  return 'h' + hex
}

/**
 * Rend un diagramme PlantUML en SVG inline avec tous les avantages du SVG:
 * - Scalabilité sans perte
 * - Hyperliens cliquables
 * - Texte sélectionnable
 */
export async function renderPlantUMLSVG(
  pumlContent: string,
  fileName: string,
  server = 'https://www.plantuml.com/plantuml'
): Promise<string> {
  const encodedContent = encodePlantUML(pumlContent)
  // Forcer SVG pour profiter de tous les avantages
  const plantUMLUrl = `${server}/svg/~${encodedContent}`

  // Charger le SVG directement pour l'injecter inline
  let svgContent = ''
  try {
    const response = await fetch(plantUMLUrl, { cache: 'no-cache' })
    if (response.ok) {
      svgContent = await response.text()
      // S'assurer que c'est bien du SVG
      if (svgContent.includes('<svg')) {
        // Ajouter des styles pour le SVG
        svgContent = svgContent.replace(
          '<svg',
          '<svg style="max-width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"'
        )
      } else {
        svgContent = `<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de rendu PlantUML<br><small>Le serveur n'a pas retourné de SVG valide</small></div>`
      }
    } else {
      svgContent = `<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de rendu PlantUML<br><small>Code HTTP: ${response.status}</small></div>`
    }
  } catch (error) {
    svgContent = `<div style='color: #d73a49; padding: 40px; border: 2px solid #d73a49; border-radius: 6px;'>❌ Erreur de connexion au serveur PlantUML<br><small>${error instanceof Error ? error.message : 'Erreur inconnue'}</small></div>`
  }

  return `
    <div class="plantuml-page-container" style="padding: 20px;">
      <div style="margin-bottom: 20px;">
        <a href="#" onclick="history.back(); return false;" style="color: #0366d6; text-decoration: none;">
          ← Retour
        </a>
      </div>
      <h1>${fileName}</h1>
      <div class="plantuml-diagram-wrapper" style="text-align: center; margin: 20px 0;">
        ${svgContent}
      </div>
      <details style="margin-top: 30px; padding: 15px; background: #f6f8fa; border-radius: 6px;">
        <summary style="cursor: pointer; font-weight: bold;">📄 Code source PlantUML</summary>
        <pre style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #e1e4e8; border-radius: 3px; overflow-x: auto;"><code>${pumlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </details>
      <div style="margin-top: 20px; padding: 10px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
        <strong>✨ Avantages du SVG</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>Zoom infini sans perte de qualité (format vectoriel)</li>
          <li>Hyperliens cliquables dans le diagramme</li>
          <li>Texte sélectionnable et copiable</li>
        </ul>
      </div>
    </div>
  `
}

/**
 * Charge un fichier .puml depuis les racines de contenu configurées
 */
export async function loadPlantUML(roots: Root[], routePath: string): Promise<string | null> {
  // S'assurer que le chemin se termine par .puml
  const directPath = routePath.endsWith('.puml') ? routePath : routePath + '.puml'
  
  for (const r of roots) {
    // Nettoyer le root (enlever trailing slash)
    const prefix = r.root.replace(/\/$/, '')
    // Construire l'URL en gérant les slashes (éviter les doubles //)
    const url = prefix === '' || prefix === '/' 
      ? directPath  // Si root est "/", utiliser directement le path
      : prefix + directPath  // Sinon, concaténer
    
    console.log('[loadPlantUML] Trying URL:', url)
    
    try {
      const res = await fetch(url, { cache: 'no-cache' })
      if (res.ok) {
        console.log('[loadPlantUML] Success:', url)
        return await res.text()
      }
    } catch (error) {
      console.log('[loadPlantUML] Fetch error:', error)
    }
  }
  console.log('[loadPlantUML] File not found:', routePath)
  return null
}
