/**
 * Gate CI : contrôle de taille du noyau OntoWave (dist/ontowave.min.js)
 *
 * Échoue si le noyau dépasse le seuil actif documenté dans
 * docs/specs/roadmap.fr.md §1.
 *
 * Seuil actif : voir THRESHOLD_BYTES ci-dessous.
 * Ce seuil doit converger vers ≤200KB (cible finale v2.0).
 *
 * Usage : node tools/check-dist-size.mjs
 */

import { statSync, existsSync } from 'fs'

// ─── Seuil actif ─────────────────────────────────────────────────────────────
// Première itération v2 : noyau séparé des extensions lourdes.
// Le noyau mesure actuellement ~149 KB (minifié, avant gzip).
// Le seuil est aligné sur la cible finale v2.0 (≤200 KB).
// À abaisser si le noyau grossit au-delà de la cible.
const THRESHOLD_BYTES = 200_000 // 200KB — cible finale v2.0
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_FILE = 'dist/ontowave.min.js'

if (!existsSync(TARGET_FILE)) {
  console.error(`❌ Fichier introuvable : ${TARGET_FILE}`)
  console.error('   Lancez d\'abord : npm run build:package')
  process.exit(1)
}

const { size } = statSync(TARGET_FILE)
const sizeKB = (size / 1024).toFixed(1)
const thresholdKB = (THRESHOLD_BYTES / 1024).toFixed(0)

if (size >= THRESHOLD_BYTES) {
  console.error(`❌ ${TARGET_FILE} (${sizeKB} KB) >= seuil actif ${thresholdKB} KB`)
  console.error('   Les moteurs lourds (mermaid, markdown-it, highlight.js) ne doivent')
  console.error('   pas être inline dans le noyau. Vérifiez vite.config.dist.ts et')
  console.error('   les imports statiques dans src/main.ts.')
  console.error(`   Cible finale : ≤200 KB`)
  process.exit(1)
}

console.log(`✅ ${TARGET_FILE} : ${sizeKB} KB < seuil ${thresholdKB} KB — noyau léger OK`)
console.log(`   (cible finale v2.0 : ≤200 KB — seuil à abaisser itérativement)`)
