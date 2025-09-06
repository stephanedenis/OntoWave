# Copilotage humain-IA

Objectif: accélérer le dev en gardant qualité et traçabilité.
- Commits: Conventional Commits concis (fr ok), petits lots.
- PR: petite portée, description claire, checklist ci-dessous.
- CI: build, lint, tests verts avant merge.
- Docs: changelog bref, README à jour si public API change.

Flux de collaboration IA (résumé):
- Décris l’objectif en 1 phrase et fournis le contexte minimal (fichiers, entrées/sorties, critères d’acceptation).
- Demande un résumé des changements en 1–2 phrases et 1–2 tests rapides.
- Intègre par petits commits, lance `npm run check`, mets à jour docs.
- PR courte, vérifie la checklist.
