import { Globe, ArrowRightLeft } from 'lucide-react'
import type { AppMode } from '../types/app-mode'
import { useLang, type Lang } from '../i18n/lang-context'

const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  'zh-TW': '繁中',
  'zh-CN': '简中',
  es: 'ES',
}

export function SiteBanner({
  mode,
  lang,
  setLang,
  allowModeSwitch = false,
  onSwitchMode,
}: {
  mode: AppMode
  lang: Lang
  setLang: (l: Lang) => void
  allowModeSwitch?: boolean
  onSwitchMode?: () => void
}) {
  const t = useLang()

  return (
    <div
      className={`flex items-center justify-between px-5 py-2 border-b shrink-0 ${
        mode === 'owner'
          ? 'bg-[#1a1714] border-[#2a2520]'
          : 'bg-[#1e3a5f] border-[#1a3356]'
      }`}
    >
      <div className="flex items-center gap-3">
        {allowModeSwitch ? (
          <div className="flex items-center border border-white/20 overflow-hidden text-[10px] font-mono font-semibold uppercase tracking-widest">
            <div
              className={`px-3 py-1.5 transition-colors ${
                mode === 'owner' ? 'bg-white/15 text-white' : 'text-white/40'
              }`}
            >
              {t('bannerOwner')}
            </div>
            <div
              className={`px-3 py-1.5 transition-colors ${
                mode === 'customer' ? 'bg-white/15 text-white' : 'text-white/40'
              }`}
            >
              {t('bannerCustomer')}
            </div>
          </div>
        ) : (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-white/90 px-3 py-1.5 border border-white/20">
            {mode === 'owner' ? t('bannerOwner') : t('bannerCustomer')}
          </span>
        )}
        <span className="text-[11px] font-mono text-white/50 hidden sm:block">
          {mode === 'owner' ? t('bannerOwnerDesc') : t('bannerCustomerDesc')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center border border-white/20">
          <span className="pl-2.5 text-white/40 pointer-events-none">
            <Globe className="w-3 h-3" />
          </span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label="Language"
            className="appearance-none bg-transparent pl-2 pr-7 py-1.5 text-[10px] font-mono font-semibold tracking-wide text-white focus:outline-none cursor-pointer"
          >
            {(['en', 'zh-TW', 'zh-CN', 'es'] as Lang[]).map((l) => (
              <option key={l} value={l} className="bg-[#1a1714] text-white">
                {LANG_LABELS[l]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 text-white/40 text-[8px] leading-none">▾</span>
        </div>
        {allowModeSwitch && onSwitchMode && (
          <button
            onClick={onSwitchMode}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/25 text-white/80 hover:text-white hover:border-white/50 text-[10px] font-mono font-semibold uppercase tracking-widest transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span className="hidden sm:inline">
              {mode === 'owner' ? t('switchToCustomer') : t('switchToOwner')}
            </span>
            <span className="sm:hidden">
              {mode === 'owner' ? t('bannerCustomer') : t('bannerOwner')}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use SiteBanner — kept as alias during rename */
export const ModeSwitcherBanner = SiteBanner
