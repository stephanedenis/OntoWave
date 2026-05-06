/**
 * Chargeur d'extensions dynamique — échappe le bundling Rollup/Vite.
 * Utilise new Function pour que le bundler ne tente pas d'inliner
 * les modules d'extension dans le noyau.
 *
 * Les extensions sont chargées depuis `<extBase>/<name>.js` (ESM).
 */

let _extBase = '/extensions'

/** Définit la base URL des extensions (ex: https://cdn/dist/extensions) */
export function setExtBase(base: string): void {
  _extBase = base.replace(/\/+$/, '')
}

/** Retourne la base URL des extensions actuellement configurée */
export function getExtBase(): string {
  return _extBase
}

const _loadedCache = new Map<string, Promise<unknown>>()

/**
 * Charge dynamiquement une extension par son nom.
 * Ex: loadExt('markdown') → charge `<extBase>/markdown.js`
 *
 * Le résultat est mis en cache pour éviter les doubles chargements.
 */
export function loadExt(name: string): Promise<unknown> {
  const url = `${_extBase}/${name}.js`
  if (_loadedCache.has(url)) return _loadedCache.get(url)!
  // new Function échappe l'analyse statique de Rollup/Vite
  // → mermaid, markdown-it et autres lourdes dépendances ne sont PAS
  //   incluses dans le bundle noyau
  const fn = new Function('u', 'return import(u)')
  const p = fn(url) as Promise<unknown>
  _loadedCache.set(url, p)
  return p
}
