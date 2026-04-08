# Glossaire — Dictionnaire avec soulignement et infobulle latérale

Cette page démontre la fonctionnalité **glossaire** d'OntoWave. Les termes définis dans le dictionnaire chargé sont soulignés en pointillé. Au clic, leur définition apparaît dans le panneau latéral.

## Termes du glossaire en action

L'**UAF** (Unified Architecture Framework) est le standard de l'OMG pour la modélisation d'architecture d'entreprise par vues et viewpoints.

La notion de **Capabilité** est centrale dans les cadres d'architecture modernes. Une Capabilité représente l'aptitude mesurable d'une organisation à atteindre un résultat défini.

La **Gouvernance IT** (ou Gouvernance des TI) encadre les mécanismes d'orientation et de pilotage des ressources informationnelles au sein d'une organisation.

Le cadre **AEG** (Architecture d'entreprise gouvernementale) constitue la directive SCT applicable aux organismes publics du Québec.

La loi **LGGRI** régit la gouvernance et la gestion des ressources informationnelles des organismes publics québécois.

## Comportement attendu

- Les termes définis apparaissent **soulignés en pointillé bleu** (`text-decoration: underline dotted`)
- Un **clic** sur un terme affiché dans le panneau latéral : terme, définition courte et lien vers la fiche complète
- Le survol déclenche également une **infobulle** après un délai configurable (défaut : 300 ms)
- Les termes dans les blocs `code` sont exclus : `UAF`, `Capabilité`, `LGGRI`

## Configuration

La fonctionnalité est activée via `config.json` :

```json
{
  "glossary": {
    "enabled": true,
    "sources": ["/demos/03-glossary/glossary.fr.json"],
    "matching": {
      "caseSensitive": false,
      "wordBoundary": true,
      "firstOccurrenceOnly": false
    },
    "exclude": { "elements": ["code", "pre", "kbd"] },
    "ui": {
      "underlineStyle": "dotted",
      "clickBehavior": "sidebar",
      "tooltip": { "showOnHover": true, "delay": 300, "maxWidth": 340 }
    }
  }
}
```

## Fusion de sources multiples (last-wins)

OntoWave supporte plusieurs sources de glossaire. Le dernier fichier chargé écrase les entrées conflictuelles :

```json
{
  "sources": [
    "https://culture.calme.gouv.qc.ca/glossary.fr.json",
    "./glossary.fr.json"
  ]
}
```

Clé de fusion : `term.toLowerCase()` + `alias.toLowerCase()`. Si deux sources définissent **UAF**, la seconde source prend la priorité (last-wins).

## Limite connue

- Les SVG référencés via `<img src="...">` sont hors portée (DOM inaccessible)
- Les SVG inline (Mermaid) peuvent être annotés avec `svg.inline: true`, mais le wrapping de `<text>` en `<a>` SVG peut affecter les coordonnées du layout
