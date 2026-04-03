# Routing par hash URL

Démonstration du système de routing d'OntoWave : navigation entre pages via l'ancre URL (`#`).

## Comment fonctionne le routing

OntoWave écoute les changements de hash dans l'URL (`window.location.hash`) pour charger le fichier Markdown correspondant.

### Exemples de routes

- `index.html#fr/index` → charge `demos/01-base/index.fr.md`
- `index.html#en/index` → charge `demos/01-base/index.en.md`
- `index.html#fr/markdown` → cette page (en français)
- `index.html#en/markdown` → cette page (en anglais)

## Navigation interne

Les liens Markdown relatifs fonctionnent comme des routes :

- [Retour à l'accueil des démos](../index)
- [Voir la démo Mermaid](mermaid)
- [Voir la démo PlantUML](plantuml)

## Format des URLs

Le format d'une route est `#<langue>/<chemin>` où :
- `<langue>` correspond à un `base` dans la configuration `roots`
- `<chemin>` est le chemin relatif au `root` correspondant

## Fallback de langue

Si la langue demandée n'est pas supportée, OntoWave utilise la langue par défaut (`i18n.default`).

## Limite connue

- Les routes sont sensibles à la casse sur les systèmes de fichiers Linux
- Les ancres intra-page (`#titre`) ne sont pas distinguées des routes OntoWave
