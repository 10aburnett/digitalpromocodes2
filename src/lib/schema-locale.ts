// server-only - Safe schema locale config that doesn't interfere with existing i18n
import 'server-only';
import { EN_ONLY_MODE } from './i18n-lock';

// Feature flag to enable/disable locale functionality completely
// EN_ONLY_MODE overrides this - when EN_ONLY_MODE is true, locales are disabled
const LOCALE_ENABLED = !EN_ONLY_MODE && process.env.SCHEMA_LOCALE_ENABLED === 'true';

// Conservative subset for schema markup only
export const LOCALES = ['en', 'de', 'sk'] as const;
export type Locale = typeof LOCALES[number];

export function isLocale(x?: string | null): x is Locale {
  if (!LOCALE_ENABLED) return x === 'en'; // When disabled, only 'en' is valid
  return !!x && (LOCALES as readonly string[]).includes(x);
}

export function getSchemaLocale(localeParam?: string | null): string {
  if (!LOCALE_ENABLED) return 'en'; // Always default to 'en' when disabled
  return isLocale(localeParam) ? localeParam : 'en';
}

export function isLocaleEnabled(): boolean {
  // EN-only lock: locale features disabled by design during trust phase
  return LOCALE_ENABLED;
}