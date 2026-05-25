import { createSearch } from './search'

type Root = { base?: string; root: string }

function blobDownload(name: string, data: string, type: string) {
  const blob = new Blob([data], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

async function exists(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { cache: 'no-cache' })
    return r.ok
  } catch { return false }
}

function defaultIndexMd(base?: string) {
  const title = base === 'fr' ? 'Bienvenue' : 'Welcome'
  const intro = base === 'fr' ? 'Page d’accueil par défaut.' : 'Default landing page.'
  return `# ${title}\n\n${intro}\n\n> Éditez ce fichier: \`content/${base || ''}/index.md\``
}

function defaultNavYml(roots: Root[]): string {
  if (roots.some(r => (r.base || '').toLowerCase() === 'fr')) {
  return `fr:\n  - Accueil: fr/index.md\n  - Démo:\n    - Aperçu: fr/demo/overview.md\n    - Liens: fr/demo/links.md\n    - Code: fr/demo/code.md\n    - Mermaid: fr/demo/mermaid.md\n    - Math: fr/demo/math.md\n    - PlantUML: fr/demo/plantuml.md\n    - Graphviz: fr/demo/graphviz.md\n    - D2: fr/demo/d2.md\n`
  }
  return `en:\n  - Home: en/index.md\n  - Demo:\n    - Overview: en/demo/overview.md\n    - Links: en/demo/links.md\n    - Code: en/demo/code.md\n    - Mermaid: en/demo/mermaid.md\n    - Math: en/demo/math.md\n    - PlantUML: en/demo/plantuml.md\n    - Graphviz: en/demo/graphviz.md\n    - D2: en/demo/d2.md\n`
}

export async function renderConfigPage(appEl: HTMLElement, cfg: { roots?: Root[]; brand?: string }) {
  const roots = (cfg.roots || []).map(r => ({ base: (r.base || '').toString().replace(/^\/+/,'').replace(/\/+$/,''), root: String(r.root || '') }))
  const needs: Array<{ key: string; path: string; type: 'text/plain' | 'application/json'; make: () => Promise<string> | string }> = []

  // nav.yml
  if (!(await exists('/nav.yml'))) {
    needs.push({ key: 'nav.yml', path: 'public/nav.yml', type: 'text/plain', make: () => defaultNavYml(roots) })
  }
  // pages.txt
  if (!(await exists('/pages.txt'))) {
    // minimal pages list from roots
    needs.push({ key: 'pages.txt', path: 'public/pages.txt', type: 'text/plain', make: () => roots.map(r => (r.base ? `${r.base}/index.md` : 'index.md')).join('\n') })
  }
  // search-index.json
  const hasIndex = await exists('/search-index.json')
  if (!hasIndex) {
    needs.push({ key: 'search-index.json', path: 'search-index.json', type: 'application/json', make: async () => {
      const s = createSearch()
      await s.init()
      return s.exportIndex()
    } })
  }
  // index.md per root
  for (const r of roots) {
    const prefix = r.root.replace(/\/$/,'')
    const url = `/${prefix}/index.md`
    if (!(await exists(url))) {
      const rel = (r.base ? `content/${r.base}/index.md` : 'content/index.md')
      needs.push({ key: rel, path: rel, type: 'text/plain', make: () => defaultIndexMd(r.base) })
    }
  }

  // Render page
  const cfgText = JSON.stringify(cfg, null, 2)
  appEl.innerHTML = `
    <h1>Configuration du site</h1>
    <p>Marque: <strong>${(cfg.brand || 'OntoWave')}</strong></p>
    <h2>Fichier config.json</h2>
    <p>Éditez puis téléchargez le fichier pour l’ajouter à votre déploiement statique.</p>
    <textarea id="cfg-json" style="width:100%;height:200px">${cfgText}</textarea>
    <div class="mt-sm">
      <button id="btn-dl-config" type="button">Télécharger config.json</button>
    </div>
    <h2 class="mt-sm">Fichiers manquants détectés</h2>
    <p>${needs.length ? 'Les éléments suivants semblent manquer. Vous pouvez les télécharger individuellement ou en une seule archive.' : 'Aucun fichier essentiel manquant détecté.'}</p>
    <ul id="missing-list"></ul>
    <div class="mt-sm">
      <button id="btn-dl-zip" type="button" ${needs.length ? '' : 'disabled'}>Télécharger tout en ZIP</button>
    </div>
  `

  // Populate missing list
  const ul = document.getElementById('missing-list')!
  ul.innerHTML = needs.map(n => `<li><code>${n.path}</code> <button data-key="${n.key}">Télécharger</button></li>`).join('')
  ul.addEventListener('click', async (e) => {
    const t = e.target as HTMLElement
    if (t.tagName === 'BUTTON' && t.dataset.key) {
      const item = needs.find(x => x.key === t.dataset.key)
      if (!item) return
      const data = await item.make()
      blobDownload(item.path.split('/').pop() || item.key, data, item.type)
    }
  })

  // Download config.json
  document.getElementById('btn-dl-config')?.addEventListener('click', () => {
    const ta = document.getElementById('cfg-json') as HTMLTextAreaElement
    blobDownload('config.json', ta.value, 'application/json')
  })

  // Download all as zip (dynamic import)
  document.getElementById('btn-dl-zip')?.addEventListener('click', async () => {
    if (!needs.length) return
    // Load JSZip from CDN to avoid bundling
    await new Promise((resolve) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
      s.onload = resolve
      document.head.appendChild(s)
    })
    const JSZipCtor = (window as any).JSZip
    const zip = new JSZipCtor()
    for (const n of needs) {
      const data = await n.make()
      zip.file(n.path, data)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ontowave-missing.zip'
    a.click()
    URL.revokeObjectURL(a.href)
  })
}
