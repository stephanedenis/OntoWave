import { describe, it, expect } from 'vitest'
import { createMd } from '../src/markdown'

describe('markdown rendering', () => {
  it('renders h1 and code block', () => {
    const md = createMd()
    const src = '# Titre\n\n```js\nconsole.log(1)\n```'
    const html = md.render(src)
    expect(html).toContain('<h1')
    expect(html).toContain('Titre')
    expect(html).toContain('<pre class="hljs"><code>')
  })
})
