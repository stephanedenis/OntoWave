import MarkdownIt from 'markdown-it'
import mila from 'markdown-it-link-attributes'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import katex from 'markdown-it-katex'
import hljs from 'highlight.js'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ch === '&' ? '&amp;' :
    ch === '<' ? '&lt;' :
    ch === '>' ? '&gt;' :
    ch === '"' ? '&quot;' : '&#39;'
  )
}

export function createMd() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: (str: string, lang: string): string => {
      const lc = (lang || '').trim()
      const langClass = lc ? ` language-${lc}` : ''
      if (lc && hljs.getLanguage(lc)) {
        try {
          const v = hljs.highlight(str, { language: lc, ignoreIllegals: true }).value
          return `<pre class="hljs${langClass}"><code class="${langClass.trim()}">${v}</code></pre>`
        } catch {}
      }
      return `<pre class="hljs${langClass}"><code class="${langClass.trim()}">${escapeHtml(str)}</code></pre>`
    }
  })
  md.use(anchor, { permalink: anchor.permalink.headerLink() as any })
  md.use(footnote as any)
  md.use(katex as any)
  md.use(mila as any, {
    matcher(href: string) {
      return /^(https?:)?\/\//.test(href)
    },
    attrs: { target: '_blank', rel: 'noopener' }
  })
  return md
}

export function rewriteLinks(el: HTMLElement) {
  // Convertit les liens .md internes en routes hash
  el.querySelectorAll('a[href$=".md"]').forEach((a) => {
    const href = a.getAttribute('href') || ''
    if (!/^(https?:)?\/\//.test(href)) {
      const clean = href.replace(/\.md$/i, '')
      ;(a as HTMLAnchorElement).href = '#'+(clean.startsWith('/') ? clean : ('/' + clean))
    }
  })
}
