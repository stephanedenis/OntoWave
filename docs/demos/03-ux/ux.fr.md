# Fonctionnalités UX — Lecture et Navigation

Démonstration des améliorations de lecture et de navigation d'OntoWave, inspirées des liseuses type Remarkable.

## Thèmes de lecture

OntoWave propose trois thèmes de lecture persistés dans le navigateur :

| Thème  | Description                                  |
|--------|----------------------------------------------|
| ☀ Clair  | Fond blanc, texte sombre — usage standard    |
| 📖 Sépia | Fond sépia, texte chaud — lecture prolongée  |
| 🌙 Sombre | Fond noir, texte clair — faible luminosité   |

La bascule se fait via le bouton **☀ Clair** (ou son équivalent selon le thème courant) dans la barre d'outils UX, visible en haut du contenu.

Le thème choisi est mémorisé dans `localStorage` et restauré à chaque visite.

## Navigation au clavier

Les raccourcis clavier fonctionnent lorsque le focus n'est pas dans un champ de saisie :

| Touche | Action                                         |
|--------|------------------------------------------------|
| `j`    | Défiler vers le bas (120 px)                   |
| `k`    | Défiler vers le haut (120 px)                  |
| `n`    | Aller à la page suivante (si disponible)       |
| `p`    | Aller à la page précédente (si disponible)     |

## Prefetch Markov

OntoWave observe vos transitions de navigation et construit une table de Markov en `localStorage`. À chaque changement de page, les destinations les plus probables (basées sur l'historique) sont préchargées en arrière-plan.

Cela accélère la navigation répétée sur les mêmes chemins.

## Configuration

Les fonctionnalités UX sont **activées par défaut**. Pour les désactiver globalement ou partiellement, ajoutez dans votre `config.json` :

```json
{
  "ux": false
}
```

Ou pour une configuration fine :

```json
{
  "ux": {
    "themes": true,
    "keyboard": true,
    "prefetch": true
  }
}
```
