# 🌐 OntoWave - Stratégies de Déploiement

## 🎯 Choisir la Bonne Approche

### 1. **Local + Fallback CDN** (Recommandé)
```html
<!-- Stratégie hybride -->
<script>
// Essaie local d'abord, puis CDN si échec
async function loadOntoWave() {
    try {
        await loadScript('./dist/ontowave.min.js');
    } catch {
        await loadScript('https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js');
    }
}
</script>
```

**Avantages :**
- ✅ Rapide (version locale)
- ✅ Robuste (fallback CDN)
- ✅ Fonctionne offline (si local disponible)

### 2. **Local Uniquement** (GitHub Pages)
```html
<!-- Simple et fiable -->
<script src="../dist/ontowave.min.js"></script>
```

**Avantages :**
- ✅ Aucun problème CORS
- ✅ Contrôle total
- ✅ Fonctionne offline
- ✅ Pas de dépendance externe

### 3. **CDN Uniquement** (Sites externes)
```html
<!-- Pour sites qui n'hébergent pas le fichier -->
<script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
```

**Avantages :**
- ✅ Toujours à jour
- ✅ Cache global
- ✅ Pas de fichiers à gérer

## 🚨 **Limitations par Environnement**

### **GitHub Pages**
- ❌ Restrictions CSP possibles
- ❌ HTTPS obligatoire pour CDN externes
- ✅ **Solution** : Version locale dans `/docs`

### **Netlify**
- ❌ Politiques de sécurité strictes
- ✅ Support CDN généralement OK
- ✅ **Solution** : Local + fallback CDN

### **Serveur Local de Développement**
- ❌ Mixed content (HTTP vs HTTPS)
- ❌ CORS selon configuration
- ✅ **Solution** : Version locale

### **S3 + CloudFront**
- ✅ CDN généralement OK
- ⚠️ Configuration CORS nécessaire
- ✅ **Solution** : Toutes approches

## 📁 **Structure Recommandée**

```
mon-site/
├── index.html              ← Stratégie hybride
├── docs/
│   ├── index.html          ← Version GitHub Pages
│   └── config.json         ← Configuration
├── dist/
│   ├── ontowave.js         ← Version complète
│   └── ontowave.min.js     ← Version minifiée
└── content/
    ├── index.md            ← Contenu
    └── guide.md
```

## 🎛️ **Configuration par Contexte**

### **Développement**
```html
<script src="./dist/ontowave.min.js"></script>
```

### **Production (Self-hosted)**
```html
<script src="/assets/ontowave.min.js"></script>
```

### **Production (CDN)**
```html
<script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.0/dist/ontowave.min.js"></script>
```

## 🔧 **Script de Détection Automatique**

```javascript
// Détecte automatiquement le meilleur source
function getOntoWaveSource() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return './dist/ontowave.min.js'; // Local dev
    }
    
    if (location.hostname.includes('github.io')) {
        return '../dist/ontowave.min.js'; // GitHub Pages
    }
    
    return 'https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js'; // CDN
}
```

## 🛡️ **Résoudre les Problèmes CORS**

### **Apache (.htaccess)**
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

### **Nginx**
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
```

### **Node.js/Express**
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
```

## 📊 **Comparaison des Approches**

| Approche | Vitesse | Fiabilité | Offline | Simplicité |
|----------|---------|-----------|---------|------------|
| **Local** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **CDN** | ⭐⭐ | ⭐⭐ | ❌ | ⭐⭐⭐ |
| **Hybride** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

## 🎯 **Recommandations**

1. **Développement** → Local uniquement
2. **GitHub Pages** → Local uniquement
3. **Site personnel** → Hybride (local + CDN)
4. **Site externe** → CDN uniquement

**La stratégie hybride est généralement la meilleure solution !** 🌊
