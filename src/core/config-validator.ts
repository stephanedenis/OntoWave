import type { AppConfig, RuntimeWarning } from './types'

/**
 * Valide la configuration de l'application et retourne les avertissements détectés.
 *
 * Règles :
 * - Sans `i18n` : mode unilingue par défaut, aucune erreur.
 * - Avec `i18n` mais sans `i18n.mode` : erreur de configuration explicite.
 */
export function validateConfig(cfg: AppConfig): RuntimeWarning[] {
  const warnings: RuntimeWarning[] = []

  if (cfg.i18n !== undefined && !cfg.i18n.mode) {
    warnings.push({
      code: 'I18N_MISSING_MODE',
      message:
        "[OntoWave] Configuration invalide : 'i18n.mode' est obligatoire quand 'i18n' est défini. " +
        "Valeurs acceptées : 'suffix' ou 'folder'.",
    })
  }

  return warnings
}
