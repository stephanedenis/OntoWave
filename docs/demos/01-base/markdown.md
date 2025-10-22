# Markdown Features

## Tables with Alignment

OntoWave supports full Markdown table syntax with column alignments:

| Feature | Left-aligned | Center-aligned | Right-aligned |
|:--------|:------------:|:--------------|-------------:|
| Tables  | Yes          | ✅             | 100%         |
| Lists   | Yes          | ✅             | 100%         |
| Links   | Yes          | ✅             | 100%         |

### Alignment Syntax

- Left: `:---`
- Center: `:---:`
- Right: `---:`

## Lists

### Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered Lists
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

## Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Links

- External link: [OntoWave on npm](https://www.npmjs.com/package/ontowave)
- Internal link: [Back to top](#markdown-features)
- Relative link: [See Mermaid demo](mermaid.html)

## Images

![OntoWave Logo](https://via.placeholder.com/150?text=OntoWave)

## Text Formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `Inline code`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Code Blocks

```javascript
// JavaScript code example
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('OntoWave'));
```
