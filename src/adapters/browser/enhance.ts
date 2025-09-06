
function buildTocFromHtml(html: string): string {
  const h = globalThis.document?.createElement('div')
  if (!h) return ''
  h.innerHTML = html
  const items: { id: string; text: string; level: number }[] = []
  h.querySelectorAll('h1, h2, h3').forEach((el) => {
    const id = el.id || ''
    const text = el.textContent || ''
    const level = el.tagName === 'H1' ? 1 : el.tagName === 'H2' ? 2 : 3
    if (id) items.push({ id, text, level })
  })
  return items.map(i => `${'  '.repeat(i.level - 1)}- <a href="#${i.id}">${i.text}</a>`).join('\n')
}

async function renderMermaid(container: HTMLElement) {
  const blocks = Array.from(container.querySelectorAll('pre code.language-mermaid'))
  if (blocks.length === 0) return
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({ startOnLoad: false })
  for (const code of blocks) {
    const txt = code.textContent || ''
    const target = document.createElement('div')
    target.className = 'mermaid'
    target.textContent = txt
    const pre = code.closest('pre')!
    pre.replaceWith(target)
  }
  await mermaid.run({})
}

async function renderKroki(container: HTMLElement) {
  // Support basique via images Kroki: détecte ```plantuml / ```puml / ```noml etc. et remplace par <img src="https://kroki.io/...">
  const langMap: Record<string, string> = {
    plantuml: 'plantuml', puml: 'plantuml', uml: 'plantuml',
    dot: 'graphviz', mermaid: 'mermaid', d2: 'd2', bpmn: 'bpmn'
  }
  const blocks = Array.from(container.querySelectorAll('pre code')) as HTMLElement[]
  for (const code of blocks) {
    const classes = code.className.split(/\s+/)
    const langClass = classes.find(c => c.startsWith('language-'))
    if (!langClass) continue
    const lang = langClass.replace('language-', '')
    const engine = langMap[lang]
    if (!engine || engine === 'mermaid') continue // Mermaid géré ailleurs
    const txt = code.textContent || ''
    try {
      const res = await fetch(`https://kroki.io/${engine}/svg`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: txt })
      if (!res.ok) continue
      const svg = await res.text()
      const div = document.createElement('div')
      div.className = 'diagram'
      div.innerHTML = svg
      const pre = code.closest('pre')!
      pre.replaceWith(div)
    } catch {}
  }
}

export async function enhancePage(appEl: HTMLElement, html: string) {
  // TOC
  const toc = buildTocFromHtml(html)
  const tocEl = document.getElementById('toc')
  if (tocEl) tocEl.innerHTML = toc
  // Mermaid / Kroki
  await renderMermaid(appEl)
  await renderKroki(appEl)
}
