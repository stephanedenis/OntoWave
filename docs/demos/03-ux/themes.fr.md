# Thèmes de lecture

OntoWave intègre trois thèmes de lecture activables depuis la barre UX ou par code.
Le bouton de thème dans la barre en haut de page permet de les parcourir.

## Les trois thèmes

| Thème | Classe CSS sur `<body>` | Usage |
|---|---|---|
| **Clair** | `ow-theme-light` | Lecture en pleine lumière (défaut) |
| **Sépia** | `ow-theme-sepia` | Lumière tamisée, teinte chaleureuse |
| **Sombre** | `ow-theme-dark` | Environnement sombre, faible luminosité |

## Variables CSS exposées

Chaque thème redéfinit les variables CSS suivantes sur `:root` :

| Variable | Rôle |
|---|---|
| `--ow-bg` | Couleur de fond principal |
| `--ow-text` | Couleur du texte courant |
| `--ow-link` | Couleur des liens hypertexte |
| `--ow-code-bg` | Fond des blocs de code |
| `--ow-border` | Couleur des bordures et séparateurs |
| `--ow-sidebar-bg` | Fond de la barre latérale |

Ces variables peuvent être surchargées dans votre CSS pour personnaliser les thèmes.

## Persistance

Le thème sélectionné est sauvegardé dans le `localStorage` sous la clé `ow-reading-theme`.
Il est restauré automatiquement à chaque visite.

```javascript
// Valeurs possibles
localStorage.getItem('ow-reading-theme'); // 'light' | 'sepia' | 'dark'
```

## Cycle de thèmes

La rotation s'effectue dans cet ordre : **clair → sépia → sombre → clair**.

## API JavaScript

```javascript
// Appliquer un thème spécifique
ontowave.ux.applyTheme('sepia');

// Lire le thème actif sauvegardé
const theme = ontowave.ux.loadSavedTheme(); // 'light' | 'sepia' | 'dark'

// Passer au thème suivant
const next = ontowave.ux.cycleTheme(); // retourne le nouveau thème
```

## Configuration

```json
{
  "ux": true
}
```

Ou, pour activer uniquement les thèmes :

```json
{
  "ux": { "themes": true }
}
```

## Personnalisation CSS

```css
/* Surcharger la couleur de fond du thème sombre */
body.ow-theme-dark {
  --ow-bg: #0d0d0d;
  --ow-text: #e0e0e0;
}
```

## Exemple de rendu

Voici du contenu pour observer les différences de thèmes :

> **Sépia** reproduit l'aspect d'une feuille de papier légèrement jaunie.
> C'est le thème recommandé pour les longues sessions de lecture.

Un exemple de code inline : `const color = getComputedStyle(document.body).getPropertyValue('--ow-bg');`

```typescript
// Écouter le changement de thème
document.body.addEventListener('ow:theme-change', (e) => {
  console.log('Nouveau thème :', e.detail.theme);
});
```

---

→ Démonstration suivante : [Navigation clavier](keyboard)
