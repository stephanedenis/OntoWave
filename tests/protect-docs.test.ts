import { test, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'

test('docs/ doit contenir index.html', () => {
  expect(existsSync('docs/index.html')).toBe(true)
})

test('docs/index.html doit avoir configuration dogfooding', () => {
  const content = readFileSync('docs/index.html', 'utf-8')
  expect(content).toContain('window.ontoWaveConfig')
  expect(content).toContain('externalDataSources')
})

test('vite.config.ts ne doit PAS pointer vers docs/', () => {
  const config = readFileSync('vite.config.ts', 'utf-8')
  expect(config).not.toMatch(/outDir:\s*['"]docs['"]/)
})

test('vite.config.ts doit pointer vers public-demo/', () => {
  const config = readFileSync('vite.config.ts', 'utf-8')
  expect(config).toMatch(/outDir:\s*['"]public-demo['"]/)
})

test('docs/ontowave.min.js doit exister', () => {
  expect(existsSync('docs/ontowave.min.js')).toBe(true)
})

test('.gitignore doit contenir public-demo/', () => {
  const content = readFileSync('.gitignore', 'utf-8')
  expect(content).toContain('public-demo/')
})

test('docs/ ne doit PAS être dans .gitignore', () => {
  const content = readFileSync('.gitignore', 'utf-8')
  // docs/ ne doit pas être explicitement ignoré
  expect(content).not.toMatch(/^docs\/$/m)
  expect(content).not.toMatch(/^\/docs\/$/m)
})
