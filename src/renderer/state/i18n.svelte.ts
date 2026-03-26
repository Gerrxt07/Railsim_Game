import { uiState } from './game.svelte';
import en from '../../assets/locales/en.json';
import de from '../../assets/locales/de.json';

export const translations = $state({
  en,
  de
});

if (import.meta.hot) {
  import.meta.hot.accept(['../../assets/locales/en.json', '../../assets/locales/de.json'], ([newEn, newDe]) => {
    if (newEn) translations.en = newEn.default;
    if (newDe) translations.de = newDe.default;
  });
}

export type TranslationKey = keyof typeof en;

export function t(key: TranslationKey, vars?: Record<string, string>): string {
  let str = (translations[uiState.language as 'en' | 'de'] as Record<string, string>)[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return str;
}
