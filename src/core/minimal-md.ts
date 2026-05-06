/**
 * Rendu Markdown minimal pour le noyau — aucune dépendance npm.
 * Produit du HTML basique (titres, paragraphes, blocs de code) immédiatement,
 * avant que l'extension Markdown complète ne soit chargée (rendu en deux temps).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Transforme une ligne de texte inline en appliquant gras, italique et code inline.
 */
function renderInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

/**
 * Rendu Markdown minimal.
 * Gère : titres ATX, blocs de code, listes non ordonnées, paragraphes, séparateurs.
 * Ne gère pas : tableaux, footnotes, KaTeX, diagrammes.
 * Le résultat est produit de façon synchrone sans aucun import npm.
 */
export function minimalRender(src: string): string {
  const lines = src.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bloc de code fencé (``` ... ```)
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const langClass = lang ? ` class="language-${lang}"` : ''
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(escapeHtml(lines[i]))
        i++
      }
      result.push(`<pre><code${langClass}>${code.join('\n')}</code></pre>`)
    }
    // Titre ATX (# à ######)
    else if (/^#{1,6}\s/.test(line)) {
      const m = line.match(/^(#{1,6})\s+(.*)/)!
      const level = m[1].length
      const text = renderInline(escapeHtml(m[2]))
      result.push(`<h${level}>${text}</h${level}>`)
    }
    // Séparateur horizontal
    else if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      result.push('<hr/>')
    }
    // Ligne vide → séparateur de paragraphes
    else if (line.trim() === '') {
      // ignoré
    }
    // Élément de liste non ordonnée
    else if (/^[-*+]\s/.test(line)) {
      result.push(`<li>${renderInline(escapeHtml(line.slice(2).trim()))}</li>`)
    }
    // Paragraphe
    else {
      result.push(`<p>${renderInline(escapeHtml(line))}</p>`)
    }

    i++
  }

  return result.join('\n')
}
