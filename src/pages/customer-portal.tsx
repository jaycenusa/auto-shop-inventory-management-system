import { useMemo, useState } from 'react'
import {
  Wrench, Phone, Mail, ClipboardList, Search,
} from 'lucide-react'
import type { Part } from '../types/part'
import { useLang, usePartName } from '../i18n/lang-context'
import { getPartNameSearchTerms } from '../i18n/part-names'
import { fmtCurrency, totalServicePrice } from '../utils/pricing'

const CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Transmission']

export default function CustomerPortal({ parts }: { parts: Part[] }) {
  const t = useLang()
  const partName = usePartName()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = useMemo(
    () =>
      parts.filter((p) => {
        const q = search.toLowerCase()
        const nameTerms = getPartNameSearchTerms(p.sku, p.name)
        return (
          (!q ||
            nameTerms.some((n) => n.includes(q)) ||
            p.category.toLowerCase().includes(q)) &&
          (activeCategory === 'All' || p.category === activeCategory)
        )
      }),
    [parts, search, activeCategory],
  )

  const grouped = useMemo(() => {
    const cats: Record<string, Part[]> = {}
    filtered.forEach((p) => {
      if (!cats[p.category]) cats[p.category] = []
      cats[p.category].push(p)
    })
    return cats
  }, [filtered])

  const availableCount = parts.filter((p) => p.stock > 0).length

  return (
    <div className="min-h-full h-full w-full bg-[#f7f5f0]" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <header className="bg-[#1a1714] text-white w-full">
        <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-[#c94318] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  className="text-[15px] font-bold uppercase tracking-[0.15em] text-white/90"
                >
                  {t('portalShopName')}
                </span>
              </div>
              <h1
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                className="text-5xl font-bold uppercase tracking-tight leading-none"
              >
                {t('portalTitle')}
              </h1>
              <p className="mt-3 text-white/60 text-sm max-w-2xl">{t('portalSubtitle')}</p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2 text-sm shrink-0">
              <div className="flex items-center gap-2 text-white/60">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono">+1 555-AUTO-SVC</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-mono">service@autoshop.io</span>
              </div>
              <div className="mt-2 px-3 py-1.5 border border-white/20 text-[11px] font-mono text-white/80">
                {availableCount} {t('portalOf')} {parts.length} {t('portalAvailableToday')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
        <div className="bg-white border border-[rgba(26,23,20,0.12)] px-5 py-3.5 mb-5 flex items-center gap-3">
          <ClipboardList className="w-4 h-4 text-[#c94318] shrink-0" />
          <p className="text-sm text-[#1a1714]">{t('portalAllInclusive')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[rgba(26,23,20,0.12)] px-4 py-2.5 flex-1">
            <Search className="w-4 h-4 text-[#7a7269] shrink-0" />
            <input
              placeholder={t('portalSearch')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-[#1a1714] placeholder:text-[#7a7269] focus:outline-none flex-1"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors border ${
                  activeCategory === cat
                    ? 'bg-[#1a1714] text-white border-[#1a1714]'
                    : 'bg-white border-[rgba(26,23,20,0.12)] text-[#7a7269] hover:text-[#1a1714]'
                }`}
              >
                {cat === 'All' ? t('portalAll') : cat}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white border border-[rgba(26,23,20,0.12)] p-16 text-center text-[#7a7269] font-mono text-sm">
            {t('noServicesFound')}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h2
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  className="text-xl font-bold uppercase tracking-[0.1em] text-[#1a1714]"
                >
                  {cat}
                </h2>
                <div className="flex-1 h-px bg-[rgba(26,23,20,0.1)]" />
                <span className="text-[11px] font-mono text-[#7a7269]">
                  {items.length} {t('portalServices')}
                </span>
              </div>
              <div className="bg-white border border-[rgba(26,23,20,0.12)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(26,23,20,0.08)] bg-[#f7f5f0]">
                      <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#7a7269] font-normal">
                        {t('portalColService')}
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] font-mono uppercase tracking-widest text-[#7a7269] font-normal">
                        {t('portalColTotal')}
                      </th>
                      <th className="px-5 py-3 text-center text-[10px] font-mono uppercase tracking-widest text-[#7a7269] font-normal">
                        {t('portalColAvailability')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => {
                      const available = p.stock > 0
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-[rgba(26,23,20,0.06)] last:border-0 ${
                            !available
                              ? 'opacity-55'
                              : 'hover:bg-[#faf9f6] transition-colors'
                          }`}
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#1a1714]">{partName(p.sku, p.name)}</p>
                            <p className="text-[11px] font-mono text-[#7a7269] mt-0.5">
                              {available
                                ? `${p.stock} ${t('portalInStockCount')}`
                                : t('portalOrderRequired')}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                              className="text-2xl font-bold text-[#c94318] tabular-nums"
                            >
                              {fmtCurrency(totalServicePrice(p))}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {available ? (
                              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {t('portalInStock')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest bg-stone-100 text-stone-500 border border-stone-200">
                                {t('portalOnOrder')}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        <div className="mt-8 p-4 border border-[rgba(26,23,20,0.1)] text-[12px] font-mono text-[#7a7269] text-center">
          {t('portalFooter')}
        </div>
      </div>
    </div>
  )
}
