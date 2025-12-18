# Issue: Prism syntax highlighting intermittent

## Description
The Prism.js syntax highlighting appears to be intermittent - sometimes code blocks are colored properly, sometimes they're not.

## Steps to reproduce
1. Load the OntoWave documentation page
2. Observe HTML code blocks
3. Refresh the page multiple times
4. Notice inconsistent syntax highlighting

## Expected behavior
Syntax highlighting should work consistently on every page load.

## Technical details
- Prism is enabled in config.json: `"prism": { "enabled": true }`
- Code blocks use proper language classes
- Issue seems related to timing/loading order

## Priority
Low - cosmetic issue, doesn't affect functionality

## Next steps
- Investigate Prism loading sequence
- Check for race conditions with OntoWave initialization
- Consider adding explicit Prism.highlightAll() calls after content load
