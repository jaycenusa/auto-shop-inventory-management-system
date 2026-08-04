import { createContext, useContext } from 'react'
import { T, type Lang, type TFn, type TranslationKey } from './translations'
import { getPartName } from './part-names'

export type { Lang, TFn, TranslationKey }

export const LangCtx = createContext<TFn>((key) => T.en[key])
export const CurrentLangCtx = createContext<Lang>('en')

export function useLang() {
  return useContext(LangCtx)
}

export function useCurrentLang() {
  return useContext(CurrentLangCtx)
}

/** Returns a translator for part display names based on the active language. */
export function usePartName() {
  const lang = useCurrentLang()
  return (sku: string, fallback: string) => getPartName(sku, fallback, lang)
}

export function createTranslator(lang: Lang): TFn {
  return (key) => (T[lang] as typeof T.en)[key] ?? T.en[key]
}
