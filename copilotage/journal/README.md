# 📓 Journal de Bord — OntoWave

Ce dossier contient les journaux de session de travail agent IA sur le projet OntoWave.

## Structure

```
copilotage/
  journal/
    JOURNAL_SESSION_YYYY-MM-DD_host_PID.md   # Sessions manuelles
    JOURNAL_AUTO_YYYY-MM-DD_host.md          # Auto-générés via git hooks
    lessons_learned.md                        # Leçons apprises cross-sessions
```

## Utilisation

```bash
# Démarrer une session
./copilotage/start_session.sh "Description de la mission"

# Terminer une session
./copilotage/end_session.sh
```

## Convention de nommage des sessions

Chaque session est liée à un issue GitHub :
- `feat/<numéro>-<slug>` pour les nouvelles fonctionnalités
- `fix/<numéro>-<slug>` pour les corrections
- `chore/<numéro>-<slug>` pour les tâches de maintenance
