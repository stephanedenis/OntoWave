#!/bin/bash
# 🚀 DÉMARRER SESSION — Initialise journal de bord OntoWave
# Usage: ./copilotage/start_session.sh "Description de la mission"

if [ -z "$1" ]; then
    echo "❌ Usage: $0 \"Description de la mission\""
    exit 1
fi

MISSION="$1"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
HOST=$(hostname)
PID=$$

JOURNAL_DIR="copilotage/journal"
mkdir -p "$JOURNAL_DIR"

SESSION_FILE="$JOURNAL_DIR/JOURNAL_SESSION_${DATE}_${HOST}_${PID}.md"
echo "$SESSION_FILE" > /tmp/ontowave_current_session.txt

cat > "$SESSION_FILE" << EOF
# 📓 JOURNAL SESSION — $MISSION

**Date**: $DATE
**Heure début**: $TIME
**Host**: $HOST
**Mission**: $MISSION

---

## 🎯 Objectifs Session

- [ ] Objectif 1
- [ ] Objectif 2

---

## 📊 État Initial

### Git Status
\`\`\`
$(git status)
\`\`\`

### Derniers Commits
\`\`\`
$(git log -5 --oneline)
\`\`\`

---

## ⏱️ Timeline

### [$TIME] Démarrage Session

**Action**: Initialisation session "$MISSION"

EOF

echo "✅ Session initialisée !"
echo "📓 Journal : $SESSION_FILE"
echo ""
echo "💡 Terminer avec : ./copilotage/end_session.sh"
