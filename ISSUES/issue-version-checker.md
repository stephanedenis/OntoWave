# Issue 2: Affichage de la version et vérification des mises à jour

## 📋 Description

OntoWave devrait afficher sa version actuelle et permettre aux utilisateurs de vérifier s'ils utilisent la dernière version disponible.

## 🎯 Objectifs

1. **Transparence** : Afficher la version actuelle d'OntoWave
2. **Maintenance** : Alerter les utilisateurs des nouvelles versions
3. **Support** : Faciliter le débogage en connaissant la version utilisée

## 💡 Fonctionnalités proposées

### Affichage de la version
- Ajouter la version dans le menu de configuration
- Afficher dans la console lors de l'initialisation
- Option pour afficher dans le footer ou à propos

### Vérification des mises à jour
- API pour vérifier la dernière version GitHub
- Notification discrète si une nouvelle version est disponible
- Lien direct vers les notes de version

## 🔧 Implémentation technique

### Version statique
```javascript
// Dans ontowave.js
const ONTOWAVE_VERSION = "1.0.0";

// Affichage dans la console
console.log(`OntoWave v${ONTOWAVE_VERSION} initialized`);

// Dans le panneau de configuration
<div class="version-info">
  OntoWave v${ONTOWAVE_VERSION}
  <a href="#" onclick="checkForUpdates()">🔄 Vérifier les mises à jour</a>
</div>
```

### Vérification des mises à jour
```javascript
async function checkForUpdates() {
  try {
    const response = await fetch('https://api.github.com/repos/stephanedenis/OntoWave/releases/latest');
    const latest = await response.json();
    const latestVersion = latest.tag_name.replace('v', '');
    
    if (latestVersion > ONTOWAVE_VERSION) {
      showUpdateNotification(latestVersion, latest.html_url);
    }
  } catch (error) {
    console.warn('Could not check for updates:', error);
  }
}
```

## 📱 Interface utilisateur

### Dans le panneau de configuration
```
┌─────────────────────────────────────┐
│ ⚙️ Configuration OntoWave           │
├─────────────────────────────────────┤
│ [Sections existantes...]            │
├─────────────────────────────────────┤
│ 📦 Version & Mises à jour           │
│                                     │
│ Version actuelle: 1.0.0             │
│ [🔄 Vérifier les mises à jour]     │
│                                     │
│ [📋 Notes de version]               │
│ [🐛 Signaler un bug]               │
└─────────────────────────────────────┘
```

### Notification de mise à jour
```
┌─────────────────────────────────────┐
│ 🆕 Nouvelle version disponible !    │
│                                     │
│ Votre version: 1.0.0                │
│ Dernière version: 1.1.0             │
│                                     │
│ [📖 Voir les nouveautés]           │
│ [⬇️ Télécharger]                   │
│ [❌ Ignorer]                       │
└─────────────────────────────────────┘
```

## 🎛️ Configuration

### Options de configuration
```javascript
{
  version: {
    show: true,                    // Afficher la version
    checkUpdates: true,            // Vérifier automatiquement
    checkInterval: 86400000,       // 24h en millisecondes
    notifications: true            // Afficher les notifications
  }
}
```

## 📁 Fichiers à modifier

- `dist/ontowave.js` : Ajout de la logique de version
- `package.json` : Version source de vérité
- Panneau de configuration : Nouvelle section version
- Documentation : Explication de la fonctionnalité

## 🔄 Phases d'implémentation

1. **Phase 1** : Affichage basique de la version
2. **Phase 2** : Vérification manuelle des mises à jour
3. **Phase 3** : Notifications automatiques
4. **Phase 4** : Interface utilisateur complète

## ⏰ Priorité

Haute - Fonctionnalité importante pour la maintenance et le support
