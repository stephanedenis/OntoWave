# Navigation vers fichiers .puml

Démonstration de la navigation directe vers des fichiers PlantUML depuis une page Markdown.

## Principe

Quand un lien Markdown pointe vers un fichier `.puml`, OntoWave :

1. Intercepte le clic sur le lien
2. Charge le fichier `.puml` depuis le serveur
3. L'envoie à Kroki pour le rendu SVG
4. Affiche le diagramme dans l'interface OntoWave

## Exemple

Consultez le [diagramme d'architecture](architecture.puml) pour voir le fonctionnement.

Le bouton **Retour** du navigateur permet de revenir à cette page.

## Syntaxe Markdown

```markdown
Consultez le [diagramme d'architecture](architecture.puml).
```

## Hyperliens dans les diagrammes

Les liens définis dans un fichier `.puml` avec la syntaxe `[[url]]` restent cliquables dans le SVG rendu.

## Limite connue

- Le rendu SVG nécessite une connexion Internet (appel à Kroki.io)
- Les fichiers `.puml` très grands peuvent dépasser les limites du serveur Kroki
