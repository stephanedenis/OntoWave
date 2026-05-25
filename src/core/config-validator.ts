import type { AppConfig, RuntimeWarning } from './types'

/**
 * Valide la configuration de l'application et retourne les avertissements détectés.
 *
 * Règles :
 * - Sans `i18n` : mode unilingue par défaut, aucune erreur.
 * - Avec `i18n` mais sans `i18n.mode` : avertissement de configuration explicite.
 *   (La config peut venir d'un JSON externe où `mode` est absent malgré la contrainte TypeScript.)
 */
export function validateConfig(cfg: AppConfig): RuntimeWarning[] {
  const warnings: RuntimeWarning[] = []

  // Runtime check: even though I18nConfig.mode is required by the type, a JSON-loaded
  // config may violate this — detect it explicitly before the router acts on it.
  if (cfg.i18n !== undefined && !(cfg.i18n as { mode?: string }).mode) {
    warnings.push({
      code: 'I18N_MISSING_MODE',
      message:
        "[OntoWave] Configuration invalide : 'i18n.mode' est obligatoire quand 'i18n' est défini. " +
        "Valeurs acceptées : 'suffix' ou 'folder'.",
    })
  }

  return warnings
}
