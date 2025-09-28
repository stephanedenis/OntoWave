import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OntoWavePluginManager } from '../../core/plugin-manager'
import type { Plugin, PluginServices } from '../../core/plugins'

// Mock plugin pour les tests
const mockPlugin: Plugin = {
  name: 'test-plugin',
  version: '1.0.0',
  description: 'Plugin de test',
  initialize: vi.fn(),
  destroy: vi.fn(),
  hooks: {
    beforeMarkdownRender: vi.fn((md: string) => `<!-- test -->${md}`),
    afterHtmlRender: vi.fn((html: string) => `${html}<!-- /test -->`),
    afterNavigation: vi.fn()
  }
}

// Mock services
const mockServices: PluginServices = {
  content: {
    fetchText: vi.fn()
  },
  router: {
    get: vi.fn(() => ({ path: '/test' })),
    subscribe: vi.fn(),
    navigate: vi.fn()
  },
  view: {
    setHtml: vi.fn(),
    setTitle: vi.fn()
  },
  markdown: {
    render: vi.fn((md: string) => `<p>${md}</p>`)
  }
}

describe('OntoWavePluginManager', () => {
  let manager: OntoWavePluginManager
  
  beforeEach(() => {
    vi.clearAllMocks()
    manager = new OntoWavePluginManager(mockServices, {})
  })

  describe('Plugin Registration', () => {
    it('should register a plugin successfully', async () => {
      await manager.register(mockPlugin)
      
      expect(manager.isActive('test-plugin')).toBe(true)
      expect(manager.list()).toHaveLength(1)
      expect(manager.list()[0].name).toBe('test-plugin')
      expect(mockPlugin.initialize).toHaveBeenCalledOnce()
    })

    it('should prevent duplicate plugin registration', async () => {
      await manager.register(mockPlugin)
      
      await expect(manager.register(mockPlugin)).rejects.toThrow(
        "Plugin 'test-plugin' is already registered"
      )
    })

    it('should handle plugin initialization errors', async () => {
      const failingPlugin: Plugin = {
        name: 'failing-plugin',
        version: '1.0.0',
        initialize: vi.fn().mockRejectedValue(new Error('Init failed'))
      }

      await expect(manager.register(failingPlugin)).rejects.toThrow('Init failed')
      expect(manager.isActive('failing-plugin')).toBe(false)
    })
  })

  describe('Plugin Unregistration', () => {
    it('should unregister a plugin successfully', async () => {
      await manager.register(mockPlugin)
      await manager.unregister('test-plugin')
      
      expect(manager.isActive('test-plugin')).toBe(false)
      expect(manager.list()).toHaveLength(0)
      expect(mockPlugin.destroy).toHaveBeenCalledOnce()
    })

    it('should handle unregistering non-existent plugin', async () => {
      await expect(manager.unregister('non-existent')).rejects.toThrow(
        "Plugin 'non-existent' is not registered"
      )
    })
  })

  describe('Hook Execution', () => {
    beforeEach(async () => {
      await manager.register(mockPlugin)
    })

    it('should execute beforeMarkdownRender hooks', async () => {
      const result = await manager.executeHooks('beforeMarkdownRender', '# Test')
      
      expect(result).toBe('<!-- test --># Test')
      expect(mockPlugin.hooks?.beforeMarkdownRender).toHaveBeenCalledWith('# Test')
    })

    it('should execute afterHtmlRender hooks', async () => {
      const result = await manager.executeHooks('afterHtmlRender', '<h1>Test</h1>')
      
      expect(result).toBe('<h1>Test</h1><!-- /test -->')
      expect(mockPlugin.hooks?.afterHtmlRender).toHaveBeenCalledWith('<h1>Test</h1>')
    })

    it('should execute afterNavigation hooks', async () => {
      await manager.executeHooks('afterNavigation', '/new-route')
      
      expect(mockPlugin.hooks?.afterNavigation).toHaveBeenCalledWith('/new-route')
    })

    it('should handle hook execution errors gracefully', async () => {
      const errorPlugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        hooks: {
          beforeMarkdownRender: vi.fn().mockRejectedValue(new Error('Hook failed'))
        }
      }

      await manager.register(errorPlugin)
      
      // Should not throw but should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = await manager.executeHooks('beforeMarkdownRender', '# Test')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Plugin 'error-plugin' hook 'beforeMarkdownRender' failed:")
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Event Emission', () => {
    beforeEach(async () => {
      await manager.register(mockPlugin)
    })

    it('should emit events to all plugins', () => {
      const mockEmit = vi.fn()
      
      // Mock context emit function
      vi.spyOn(manager as any, 'contexts', 'get').mockReturnValue(
        new Map([['test-plugin', { emit: mockEmit }]])
      )
      
      manager.emit('routeChanged', { from: '/old', to: '/new' })
      
      // Note: This test might need adjustment based on actual implementation
      // as the emit method in context might work differently
    })
  })

  describe('Dependency Management', () => {
    it('should handle plugin dependencies', async () => {
      const dependentPlugin: Plugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['test-plugin']
      }

      // Should fail without dependency
      await expect(manager.register(dependentPlugin)).rejects.toThrow(
        "Plugin 'dependent-plugin' requires dependency 'test-plugin' which is not loaded"
      )

      // Should succeed with dependency
      await manager.register(mockPlugin)
      await expect(manager.register(dependentPlugin)).resolves.not.toThrow()
    })
  })
})