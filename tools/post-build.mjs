#!/usr/bin/env node
/**
 * Script post-build : Copie le contenu de content/ vers docs/
 * Exécuté automatiquement après `vite build`
 */

import { cp } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const contentDir = join(projectRoot, 'content')
const docsDir = join(projectRoot, 'docs')

async function copyContent() {
  console.log('📋 Post-build: Copie du contenu...')
  
  if (!existsSync(contentDir)) {
    console.log('⚠️  Dossier content/ introuvable, rien à copier')
    return
  }
  
  if (!existsSync(docsDir)) {
    console.log('⚠️  Dossier docs/ introuvable')
    return
  }
  
  try {
    await cp(contentDir, docsDir, { 
      recursive: true,
      force: true,
      filter: (src) => {
        // Copier tous les fichiers sauf les fichiers cachés
        const name = src.split('/').pop()
        return !name.startsWith('.')
      }
    })
    console.log('✅ Contenu copié dans docs/')
  } catch (err) {
    console.error('❌ Erreur lors de la copie:', err.message)
    process.exit(1)
  }
}

copyContent()
