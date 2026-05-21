import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const roadmapPath = path.join(repoRoot, 'docs', 'specs', 'roadmap.fr.md')
const corePath = path.join(repoRoot, 'dist', 'ontowave.js')

function parseThresholdKb(roadmap) {
  const match = roadmap.match(/(?:<=|≤)\s*(\d+)KB/i)
  if (!match) {
    throw new Error('Unable to parse active core size threshold from docs/specs/roadmap.fr.md')
  }
  return Number(match[1])
}

const roadmap = fs.readFileSync(roadmapPath, 'utf8')
const thresholdKb = parseThresholdKb(roadmap)
const thresholdBytes = thresholdKb * 1024

const stat = fs.statSync(corePath)
const coreBytes = stat.size
const coreKb = coreBytes / 1024

console.log(`[size-gate] core: ${coreBytes} bytes (${coreKb.toFixed(2)} KB)`)
console.log(`[size-gate] threshold: < ${thresholdBytes} bytes (${thresholdKb} KB)`)

if (coreBytes >= thresholdBytes) {
  console.error('[size-gate] FAIL: dist/ontowave.js exceeds active roadmap threshold')
  process.exit(1)
}

console.log('[size-gate] PASS')
