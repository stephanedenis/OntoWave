/**
 * PlantUML adapter for v2 engine
 * Handles loading and rendering of .puml files
 */

import type { ContentService } from '../../core/types'

export type Root = { base: string; root: string }

/**
 * Encode PlantUML text to UTF-8 hexadecimal format for PlantUML API
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
 * Render PlantUML diagram as inline SVG
 */
export async function renderPlantUMLSVG(
  pumlContent: string,
  fileName: string,
  server = 'https://www.plantuml.com/plantuml'
): Promise<string> {
  const encodedContent = encodePlantUML(pumlContent)
  const plantUMLUrl = `${server}/svg/~${encodedContent}`

  let svgContent = ''
  try {
    const response = await fetch(plantUMLUrl, { cache: 'no-cache' })
    if (response.ok) {
      svgContent = await response.text()
      if (svgContent.includes('<svg')) {
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
 * Load PlantUML file from configured content roots
 */
export async function loadPlantUML(
  roots: Root[],
  routePath: string,
  content: ContentService
): Promise<string | null> {
  const resolveCandidates = (roots: Root[], path: string): string[] => {
    const candidates: string[] = []
    const p = path.replace(/\/$/, '') || '/'
    for (const r of roots) {
      const prefix = r.root.replace(/\/$/, '')
      const base = r.base.replace(/\/$/, '')
      if (p.startsWith(base)) {
        const suffix = p.slice(base.length).replace(/^\//, '')
        const joined = suffix ? `${prefix}/${suffix}` : prefix
        candidates.push(joined)
      } else {
        candidates.push(`${prefix}${p}`)
      }
    }
    return candidates
  }

  const candidates = resolveCandidates(roots, routePath)
  for (const url of candidates) {
    try {
      const text = await content.fetchText(url)
      if (text != null) return text
    } catch {}
  }
  return null
}
