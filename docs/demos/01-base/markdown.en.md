# Markdown Features

Demonstration of basic Markdown rendering by OntoWave: tables, lists, headings, formatting, links and code blocks.

## Tables with Alignment

| Left | Center | Right |
|:-----|:------:|------:|
| alpha | bravo | 1 |
| charlie | delta | 22 |
| echo | foxtrot | 333 |

## Headings

### Level 3

#### Level 4

##### Level 5

## Text Formatting

- **Bold** and *italic* and ~~strikethrough~~
- `inline code` in a sentence
- [Link to OntoWave](https://ontowave.org)

## Nested Lists

1. Item one
   - Sub-item A
   - Sub-item B
2. Item two
3. Item three

## Code Block

```javascript
// Minimal OntoWave example
window.ontoWaveConfig = {
    roots: [{ base: "en", root: "docs" }],
    i18n: { default: "en", supported: ["en"] }
};
```

## Blockquote

> OntoWave transforms Markdown files into interactive documentation in the browser, with zero dependencies.

## Known Limitations

- Tables without separator line (`|---|`) are not rendered as tables
- External images may be blocked by browser CSP policies
