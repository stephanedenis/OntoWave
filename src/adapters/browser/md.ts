import MarkdownIt from 'markdown-it'
import mila from 'markdown-it-link-attributes'
import container from 'markdown-it-container'
import anchor from 'markdown-it-anchor'
import footnote from 'markdown-it-footnote'
import katex from 'markdown-it-katex'
import hljs from 'highlight.js'
import { rewriteLinksHtml } from '../../core/logic'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ch === '&' ? '&amp;' :
    ch === '<' ? '&lt;' :
    ch === '>' ? '&gt;' :
    ch === '"' ? '&quot;' : '&#39;'
  )
}

export function createMd(options?: { light?: boolean; plugins?: { katex?: boolean; footnote?: boolean; highlight?: boolean } }) {
  const light = options?.light ?? false
  const plugins = {
    katex: options?.plugins?.katex ?? !light,
    footnote: options?.plugins?.footnote ?? !light,
    highlight: options?.plugins?.highlight ?? !light,
  }
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: (str: string, lang: string): string => {
      if (plugins.highlight && lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch {}
      }
      return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`
    }
  })
  md.use(anchor, { permalink: anchor.permalink.headerLink() as any })
  if (plugins.footnote) md.use(footnote as any)
  if (plugins.katex) md.use(katex as any)
  // Admonitions à la MkDocs: note, tip, warning, danger
  ;['note','tip','warning','danger','info'].forEach((name) => {
    md.use(container as any, name, {
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        if (token.nesting === 1) return `<div class="admonition ${name}"><p class="admonition-title">${name}</p>`
        return '</div>'
      }
    })
  })
  md.use(mila as any, {
    matcher(href: string) { return /^(https?:)?\/\//.test(href) },
    attrs: { target: '_blank', rel: 'noopener' }
  })
  return {
    render(mdSrc: string): string {
      const html = md.render(mdSrc)
      return rewriteLinksHtml(html)
    }
  }
}
