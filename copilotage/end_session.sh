#!/bin/bash
# 🏁 TERMINER SESSION — Finalise journal OntoWave
# Usage: ./copilotage/end_session.sh

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)

if [ -f /tmp/ontowave_current_session.txt ]; then
    SESSION_FILE=$(cat /tmp/ontowave_current_session.txt)
else
    SESSION_FILE=$(ls -t copilotage/journal/JOURNAL_SESSION_${DATE}_*.md 2>/dev/null | head -1)
fi

if [ -z "$SESSION_FILE" ] || [ ! -f "$SESSION_FILE" ]; then
    echo "⚠️  Aucune session active trouvée"
    exit 1
fi

cat >> "$SESSION_FILE" << EOF

---

## 🏁 Fin de Session

### [$TIME] Clôture

### Git Status Final
\`\`\`
$(git status)
\`\`\`

### Commits de la session
\`\`\`
$(git log --oneline --since="today" 2>/dev/null || git log -10 --oneline)
\`\`\`

### Résumé
- **Heure fin** : $TIME
- **Statut** : ✅ Session complétée

EOF

rm -f /tmp/ontowave_current_session.txt
echo "🏁 Session terminée"
echo "📓 Journal : $SESSION_FILE"
