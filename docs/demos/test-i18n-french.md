# Test i18n - Français

Ce document teste la détection automatique de langue avec fallback sur `defaultLocale: "fr"`.

## Contenu en Français

Bienvenue dans OntoWave ! Cette page est en français.

### Fonctionnalités testées

- Détection automatique de `navigator.language`
- Fallback sur `defaultLocale: "fr"`
- Redirection vers `sources.fr` si détecté
- Menu OntoWave en français

## Diagramme Test

```plantuml
@startuml
participant Navigateur
participant OntoWave

Navigateur -> OntoWave: Charge page
OntoWave -> Navigateur: Détecte langue (fr)
OntoWave -> OntoWave: Redirige vers sources.fr
OntoWave -> Navigateur: Affiche contenu français
@enduml
```

---

