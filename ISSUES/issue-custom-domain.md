# Issue 3: Configuration GitHub Pages pour ontowave.com

## 📋 Description

Configurer GitHub Pages pour supporter le domaine personnalisé **ontowave.com** et mettre à jour tous les liens correspondants dans le projet.

## 🎯 Objectifs

1. **Domaine personnalisé** : Faire pointer ontowave.com vers GitHub Pages
2. **Configuration DNS** : Configurer les enregistrements appropriés
3. **HTTPS** : Assurer la sécurité avec certificat SSL
4. **Mise à jour des liens** : Remplacer tous les liens GitHub Pages par ontowave.com

## 🔧 Configuration technique

### 1. Configuration GitHub Pages

```yaml
# Dans les paramètres du repository GitHub
Pages:
  Source: Deploy from a branch
  Branch: main
  Folder: /docs
  Custom domain: ontowave.com
  Enforce HTTPS: ✅
```

### 2. Configuration DNS requise

```dns
# Enregistrements DNS à configurer
Type: CNAME
Name: www
Value: stephanedenis.github.io

Type: A (ou ALIAS selon le provider)
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 3. Fichier CNAME

```
# Créer docs/CNAME
ontowave.com
```

## 📝 Mise à jour des liens

### Fichiers à modifier

1. **README.md**
   ```markdown
   - Demo: https://stephanedenis.github.io/OntoWave/
   + Demo: https://ontowave.com/
   ```

2. **package.json**
   ```json
   - "homepage": "https://github.com/stephanedenis/OntoWave"
   + "homepage": "https://ontowave.com"
   ```

3. **docs/index.md**
   ```markdown
   - Tous les liens internes restent relatifs
   - Liens externes vers GitHub : garder
   - Liens de démonstration : pointer vers ontowave.com
   ```

4. **dist/ontowave.js** (commentaires)
   ```javascript
   - * URL: https://github.com/stephanedenis/OntoWave
   + * URL: https://ontowave.com
   + * GitHub: https://github.com/stephanedenis/OntoWave
   ```

### Script de mise à jour automatique

```bash
#!/bin/bash
# update-domain.sh

echo "🔄 Mise à jour des liens vers ontowave.com..."

# Remplacer dans README.md
sed -i 's|https://stephanedenis.github.io/OntoWave/|https://ontowave.com/|g' README.md

# Remplacer dans package.json
sed -i 's|"homepage": "https://github.com/stephanedenis/OntoWave"|"homepage": "https://ontowave.com"|g' package.json

# Remplacer dans la documentation
find docs/ -name "*.md" -exec sed -i 's|stephanedenis.github.io/OntoWave|ontowave.com|g' {} \;

# Créer le fichier CNAME
echo "ontowave.com" > docs/CNAME

echo "✅ Mise à jour terminée!"
```

## 🌐 Avantages attendus

### Pour les utilisateurs
- **URL mémorable** : ontowave.com plus facile à retenir
- **Professionnalisme** : Image plus professionnelle
- **Performance** : Potentiellement plus rapide avec CDN

### Pour le projet
- **Branding** : Renforce l'identité de marque
- **SEO** : Meilleur référencement avec domaine propre
- **Flexibilité** : Possibilité de redirection/migration future

## ⚠️ Considérations importantes

### 1. Acquisition du domaine
- Vérifier la disponibilité d'ontowave.com
- Acheter le domaine chez un registrar
- Configurer les DNS

### 2. Transition en douceur
- Maintenir les anciens liens fonctionnels
- Redirection automatique GitHub Pages → ontowave.com
- Période de transition avec les deux URLs

### 3. Monitoring
- Surveiller la propagation DNS
- Vérifier le certificat SSL
- Tester tous les liens après migration

## 📋 Checklist de déploiement

- [ ] Acquisition du domaine ontowave.com
- [ ] Configuration des enregistrements DNS
- [ ] Création du fichier docs/CNAME
- [ ] Configuration GitHub Pages
- [ ] Vérification du certificat SSL
- [ ] Mise à jour des liens dans le code
- [ ] Tests de tous les liens
- [ ] Mise à jour de la documentation
- [ ] Communication aux utilisateurs

## 🔄 Phases d'implémentation

### Phase 1: Préparation
- Acquisition du domaine
- Configuration DNS initiale

### Phase 2: Configuration
- Setup GitHub Pages
- Création du fichier CNAME
- Tests de base

### Phase 3: Migration
- Mise à jour de tous les liens
- Tests complets
- Documentation

### Phase 4: Communication
- Annonce de la nouvelle URL
- Mise à jour des références externes

## ⏰ Priorité

Moyenne - Dépend de l'acquisition du domaine ontowave.com

## 📞 Actions immédiates requises

1. **Vérifier la disponibilité** d'ontowave.com
2. **Estimer le coût** d'acquisition et maintenance
3. **Planifier la timeline** de migration
