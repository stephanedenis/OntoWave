# UX Features — Reading and Navigation

Demonstration of OntoWave's reading and navigation enhancements, inspired by e-readers like the Remarkable.

## Reading Themes

OntoWave provides three reading themes persisted in the browser:

| Theme  | Description                                      |
|--------|--------------------------------------------------|
| ☀ Light  | White background, dark text — standard use       |
| 📖 Sepia | Sepia background, warm text — extended reading   |
| 🌙 Dark  | Black background, light text — low light         |

Toggle via the **☀ Light** button (or its equivalent for the current theme) in the UX toolbar at the top of the content.

The chosen theme is saved in `localStorage` and restored on every visit.

## Keyboard Navigation

Keyboard shortcuts work when focus is not in an input field:

| Key | Action                                      |
|-----|---------------------------------------------|
| `j` | Scroll down (120 px)                        |
| `k` | Scroll up (120 px)                          |
| `n` | Go to next page (if available)              |
| `p` | Go to previous page (if available)          |

## Markov Prefetch

OntoWave tracks your navigation transitions and builds a Markov table in `localStorage`. On every page change, the most likely destinations (based on history) are prefetched in the background.

This speeds up repeated navigation on the same paths.

## Configuration

UX features are **enabled by default**. To disable them globally or partially, add to your `config.json`:

```json
{
  "ux": false
}
```

Or for fine-grained configuration:

```json
{
  "ux": {
    "themes": true,
    "keyboard": true,
    "prefetch": true
  }
}
```
