# 🚀 Actions manuelles à effectuer sur GitHub

## ✅ Étapes obligatoires pour activer GitHub Pages

### 1. Activer GitHub Pages
1. **Aller sur** : https://github.com/stephanedenis/OntoWave/settings/pages
2. **Dans "Source"** : Sélectionner **"GitHub Actions"** (pas "Deploy from a branch")
3. **Dans "Custom domain"** : Vérifier que `ontowave.com` est indiqué
4. **Cocher "Enforce HTTPS"** si disponible

### 2. Vérifier les permissions du repository
1. **Aller sur** : https://github.com/stephanedenis/OntoWave/settings/actions
2. **Dans "Workflow permissions"** : Sélectionner **"Read and write permissions"**
3. **Cocher** : "Allow GitHub Actions to create and approve pull requests"

### 3. Attendre le premier déploiement
1. **Aller sur** : https://github.com/stephanedenis/OntoWave/actions
2. **Vérifier** que le workflow "Deploy to GitHub Pages" se lance automatiquement
3. **Attendre** que le déploiement soit vert (✅)

## 🌐 Configuration DNS (si ontowave.com n'est pas encore configuré)

### Pour le domaine ontowave.com, ajouter les enregistrements :

**Enregistrements A (pour le domaine racine @) :**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @  
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**Enregistrement CNAME (pour www) :**
```
Type: CNAME
Name: www
Value: stephanedenis.github.io
```

## 📊 Vérification finale

### Une fois GitHub Pages activé, le site sera disponible à :
- ✅ **URL GitHub** : https://stephanedenis.github.io/OntoWave/
- ✅ **Domaine personnalisé** : https://ontowave.com/ (après configuration DNS)

### Tests à effectuer :
1. **Page d'accueil** : Vérifier que https://ontowave.com/ charge correctement
2. **Démos** : Tester que les démos (01-minimal.html, etc.) fonctionnent
3. **OntoWave.js** : Vérifier que la bibliothèque charge et génère des diagrammes
4. **Responsive** : Tester sur mobile et desktop

## 🔄 Mises à jour automatiques

Dès que GitHub Pages est activé :
- ✅ **Push vers main** → Déploiement automatique
- ✅ **Tests E2E** → Vérification avant déploiement  
- ✅ **Build automatique** → Mise à jour du site en ligne

## 🆘 En cas de problème

### Si le déploiement échoue :
1. Vérifier les logs dans l'onglet "Actions"
2. S'assurer que `docs/ontowave.min.js` existe et n'est pas corrompu
3. Vérifier que les permissions GitHub Actions sont correctes

### Si le domaine ne fonctionne pas :
1. Vérifier que le CNAME est correctement configuré sur GitHub
2. Attendre la propagation DNS (peut prendre 24-48h)
3. Tester d'abord avec l'URL GitHub avant le domaine personnalisé

## 📞 Support
En cas de problème, consulter :
- https://docs.github.com/en/pages
- Les logs de déploiement dans l'onglet Actions du repository
