# 🚫 RÈGLE AUTONOMIE AGENTS - INTERDICTION PAGERS/ÉDITEURS

## ⚠️ RÈGLE CRITIQUE : ZÉRO INTERACTION TERMINALE

### 🚨 STRICTEMENT INTERDIT :
- ❌ **Pagers** : `less`, `more`, `git log`, `man`, `--help` avec pagination
- ❌ **Éditeurs** : `vi`, `vim`, `nano`, `emacs`, tout éditeur interactif
- ❌ **Prompts** : Toute commande demandant une saisie utilisateur
- ❌ **Confirmations** : `y/n`, `press any key`, etc.

### ✅ SOLUTIONS OBLIGATOIRES :

#### Pour Git :
```bash
# TOUJOURS utiliser --no-pager
git log --no-pager --oneline -5
git diff --no-pager
git show --no-pager

# Ou configurer globalement
git config --global core.pager ""
```

#### Pour GitHub CLI :
```bash
# TOUJOURS --no-pager
gh pr view --no-pager
gh secret list --no-pager
gh run list --no-pager

# Variables d'environnement
export GH_PAGER=""
export PAGER=""
```

#### Pour Man/Help :
```bash
# Éviter man, utiliser --help avec limitation
command --help | head -20
# Ou redirection
man command 2>/dev/null | head -30
```

#### Pour les confirmations :
```bash
# TOUJOURS utiliser flags non-interactifs
rm -f file              # pas rm -i
cp -f source dest       # pas cp -i  
npm install --yes       # pas d'interaction
git push --force-with-lease  # explicite
```

## 🔧 CONFIGURATION AUTOMATIQUE

### Script de configuration globale :
```bash
#!/bin/bash
# Configuration anti-pager globale

# Git
git config --global core.pager ""
git config --global pager.log false
git config --global pager.diff false

# Environnement
echo 'export PAGER=""' >> ~/.bashrc
echo 'export GH_PAGER=""' >> ~/.bashrc
echo 'export MANPAGER=""' >> ~/.bashrc
echo 'export EDITOR=""' >> ~/.bashrc
echo 'export VISUAL=""' >> ~/.bashrc

# Reload
source ~/.bashrc
```

## 📋 CHECKLIST OBLIGATOIRE

Avant chaque commande, vérifier :
- [ ] Pas de pager possible (`--no-pager`, `| head`, `| cat`)
- [ ] Pas d'éditeur appelé (flags `--no-edit`, variables vides)
- [ ] Pas d'interaction (`--yes`, `--force`, `--quiet`)
- [ ] Timeout si nécessaire (`timeout 10s command`)

## 🎯 EXEMPLES CORRECTS

### ✅ Bonnes pratiques :
```bash
# Au lieu de : gh pr view (bloque avec pager)
gh pr view --no-pager

# Au lieu de : git log (bloque avec pager)  
git log --no-pager --oneline -5

# Au lieu de : npm install (peut demander confirmation)
npm install --yes

# Au lieu de : rm file (peut demander confirmation)
rm -f file
```

### ❌ À éviter absolument :
```bash
gh pr view                    # PAGER !
git log                       # PAGER !
vi file.txt                   # ÉDITEUR !
npm install                   # INTERACTION !
rm -i file                    # CONFIRMATION !
```

## 🚀 IMPLÉMENTATION IMMÉDIATE

Cette règle s'applique à :
- ✅ Tous les scripts dans `/scripts/`
- ✅ Tous les workflows GitHub Actions
- ✅ Tous les outils de développement
- ✅ Toute commande exécutée par les agents

**🎯 OBJECTIF : 100% d'autonomie, ZÉRO blocage terminal**