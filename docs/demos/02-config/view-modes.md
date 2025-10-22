# View Modes

OntoWave supports different rendering modes via query parameters.

## Available Modes

### Normal Mode (default)
Shows only the rendered HTML/SVG output.

[View in normal mode](view-modes.html)

### Split View (`?view=split`)
Shows Markdown source and rendered output side-by-side.

[View in split mode](?view=split)

### Source-Only Mode (`?view=md`)
Shows only the Markdown source code.

[View source only](?view=md)

## Configuration

No special config needed - view modes work with query parameters:

```html
<!-- Just add ?view parameter to URL -->
<a href="page.html?view=split">Split View</a>
<a href="page.html?view=md">Source Only</a>
```

## Use Cases

| Mode | Use Case |
|:-----|:---------|
| Normal | End-user documentation reading |
| Split | Content editing, debugging |
| MD | Copy source, inspect raw markdown |

## Example Table

| Feature | Split View | MD View | Normal |
|:--------|:----------:|:-------:|:------:|
| HTML Render | ✅ | ❌ | ✅ |
| MD Source | ✅ | ✅ | ❌ |
| Side-by-side | ✅ | ❌ | ❌ |

## Code Example

```javascript
// No JavaScript needed!
// Just append ?view= to your URL
window.location.href += '?view=split';
```
