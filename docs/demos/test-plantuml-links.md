# Test PlantUML - Liens Cliquables

Ce document teste la préservation des liens cliquables dans les SVG PlantUML après insertion directe.

## Diagramme avec Liens

```plantuml
@startuml
package "OntoWave Core" {
  [main.ts] [[https://github.com/stephanedenis/OntoWave/blob/main/src/main.ts]]
  [markdown.ts] [[https://github.com/stephanedenis/OntoWave/blob/main/src/markdown.ts]]
  [plantuml.ts] [[https://github.com/stephanedenis/OntoWave/blob/main/src/plantuml.ts]]
}

package "Tests" {
  [01-plantuml-minimal.spec.js]
  [05-plantuml-links.spec.js] [[#]]
}

[main.ts] --> [markdown.ts]
[main.ts] --> [plantuml.ts]
[Tests] ..> [OntoWave Core]
@enduml
```

## Navigation Test

Cliquer sur les éléments avec liens dans le diagramme ci-dessus devrait :

- Ouvrir GitHub pour `main.ts`, `markdown.ts`, `plantuml.ts`
- Naviguer dans la page pour `05-plantuml-links.spec.js`

---

**Tests attendus** :

- ✅ Liens `<a>` présents dans le SVG
- ✅ Attributs `href` préservés
- ✅ Click fonctionnel (navigation)
- ✅ Pas de wrappers bloquant les événements
