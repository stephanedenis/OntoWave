import { describe, it, expect, vi } from 'vitest'
import { createPluginManager } from '../src/core/plugins'
import { createApp } from '../src/app'
import type { OntoWavePlugin, PluginContext } from '../src/core/types'

describe('createPluginManager', () => {
  it('enregistre un plugin et le retourne dans getPlugins()', () => {
    const pm = createPluginManager()
    const plugin: OntoWavePlugin = { name: 'test-plugin' }
    pm.register(plugin)
    expect(pm.getPlugins()).toHaveLength(1)
    expect(pm.getPlugins()[0].name).toBe('test-plugin')
  })

  it('retourne le manager pour le chaînage via use()', () => {
    const pm = createPluginManager()
    const p1: OntoWavePlugin = { name: 'p1' }
    const p2: OntoWavePlugin = { name: 'p2' }
    const ret = pm.use(p1).use(p2)
    expect(ret).toBe(pm)
    expect(pm.getPlugins()).toHaveLength(2)
  })

  it('ignore un plugin déjà enregistré (même nom)', () => {
    const pm = createPluginManager()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    pm.register({ name: 'dup' })
    pm.register({ name: 'dup' })
    expect(pm.getPlugins()).toHaveLength(1)
    expect(warnSpy).toHaveBeenCalledOnce()
    warnSpy.mockRestore()
  })

  it('retourne une copie independante a chaque appel (pas de mutation externe)', () => {
    const pm = createPluginManager()
    pm.register({ name: 'immutable' })
    const list1 = pm.getPlugins() as OntoWavePlugin[]
    list1.push({ name: 'injected' })
    // The manager internal state should not be affected
    expect(pm.getPlugins()).toHaveLength(1)
    expect(pm.getPlugins()[0].name).toBe('immutable')
  })
})

describe('createApp avec plugins', () => {
  function buildDeps(plugins?: OntoWavePlugin[]) {
    const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async (_url: string) => null as string | null }
    const resolver = { resolveCandidates: () => ['/content/index.md'] }
    let html = ''
    const view = { setHtml: (h: string) => { html = h }, setTitle: (_t: string) => {} }
    const md = { render: (src: string) => src }
    const router = {
      get: () => ({ path: '/' }),
      subscribe: (_cb: (r: any) => void) => () => {},
      navigate: (_p: string) => {},
    }
    return { config, content, resolver, view, md, router, plugins, _html: () => html }
  }

  it('appelle onStart avec le contexte de plugin', async () => {
    let receivedCtx: PluginContext | null = null
    const plugin: OntoWavePlugin = {
      name: 'start-spy',
      onStart(ctx) { receivedCtx = ctx },
    }
    const deps = buildDeps([plugin])
    const app = createApp(deps)
    await app.start()
    expect(receivedCtx).not.toBeNull()
    expect(receivedCtx!.config.roots).toHaveLength(1)
  })

  it('appelle beforeRender et transforme le markdown', async () => {
    const plugin: OntoWavePlugin = {
      name: 'prepend',
      beforeRender(md) { return '> préfixe\n\n' + md },
    }
    const deps = buildDeps([plugin])
    const app = createApp(deps)
    await app.start()
    expect(deps._html()).toContain('> préfixe')
  })

  it('appelle afterRender après le rendu', async () => {
    const calls: string[] = []
    const plugin: OntoWavePlugin = {
      name: 'after-spy',
      afterRender(_html, route) { calls.push(route) },
    }
    const deps = buildDeps([plugin])
    const app = createApp(deps)
    await app.start()
    expect(calls).toHaveLength(1)
    expect(calls[0]).toBe('/')
  })

  it("appelle onStop lors de l'arret", async () => {
    let stopped = false
    const plugin: OntoWavePlugin = {
      name: 'stop-spy',
      onStop() { stopped = true },
    }
    const deps = buildDeps([plugin])
    const app = createApp(deps)
    await app.start()
    await app.stop()
    expect(stopped).toBe(true)
  })

  it("appelle onRouteChange lors d'un changement de route", async () => {
    const routes: string[] = []
    let routeCallback: ((r: any) => void) | null = null
    const plugin: OntoWavePlugin = {
      name: 'route-spy',
      onRouteChange(route) { routes.push(route) },
    }
    const deps = buildDeps([plugin])
    // Override router to capture subscribe callback
    deps.router.subscribe = (cb: (r: any) => void) => { routeCallback = cb; return () => {} }
    const app = createApp(deps)
    await app.start()
    routeCallback!({ path: '/guide' })
    // Small delay to let async plugin hook settle
    await new Promise(r => setTimeout(r, 0))
    expect(routes).toContain('/guide')
  })

  it('fonctionne sans plugins (compatibilité ascendante)', async () => {
    const deps = buildDeps()
    const app = createApp(deps)
    await expect(app.start()).resolves.toBeUndefined()
  })
})
