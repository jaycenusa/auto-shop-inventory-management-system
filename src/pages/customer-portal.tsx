import { useMemo, useState } from 'react'
import {
  Car, ClipboardList, Mail, Phone, RefreshCw, ScanLine, Search, Wrench, X,
} from 'lucide-react'
import type { Part } from '../types/part'
import { CAR_BRANDS, CAR_MODELS, vehicleYears } from '../constant/vehicles'
import { useLang, usePartName } from '../i18n/lang-context'
import { getPartNameSearchTerms } from '../i18n/part-names'
import { useVehicleIdentification } from '../hooks/use-vehicle-identification'
import { fmtCurrency, totalServicePrice } from '../utils/pricing'
import { UNAVAILABLE } from '../utils/unavailable'
import { toLookupVehicleLabel } from '../utils/vin-lookup'

const CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Transmission']

const BORDER = 'border border-[rgba(26,23,20,0.12)]'
const INPUT_BASE =
  'w-full border border-[rgba(26,23,20,0.12)] px-4 py-3 text-[#1a1714] placeholder:text-[#7a7269] text-sm focus:outline-none focus:border-[#c94318] transition-colors bg-[#faf9f6]'
const SELECT_BASE = `${INPUT_BASE} appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`

export default function CustomerPortal({
  parts,
  unavailable = false,
}: {
  parts: Part[]
  unavailable?: boolean
}) {
  const t = useLang()
  const partName = usePartName()
  const vehicle = useVehicleIdentification()
  const years = useMemo(() => vehicleYears(), [])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const activeVehicle = vehicle.activeVehicle

  const filtered = useMemo(
    () =>
      unavailable
        ? []
        : parts.filter((p) => {
            const q = search.toLowerCase()
            const nameTerms = getPartNameSearchTerms(p.sku, p.name)
            return (
              (!q ||
                nameTerms.some((n) => n.includes(q)) ||
                p.category.toLowerCase().includes(q)) &&
              (activeCategory === 'All' || p.category === activeCategory)
            )
          }),
    [parts, search, activeCategory, unavailable],
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
                {unavailable
                  ? UNAVAILABLE
                  : `${availableCount} ${t('portalOf')} ${parts.length} ${t('portalAvailableToday')}`}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
        {!activeVehicle ? (
          <div className="bg-white border border-[rgba(26,23,20,0.15)] overflow-hidden mb-6">
            <div className="bg-[#1a1714] px-5 py-4 flex items-center gap-3">
              <Car className="w-4 h-4 text-[#c94318] shrink-0" />
              <div>
                <p
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  className="text-[15px] font-bold uppercase tracking-[0.12em] text-white leading-none"
                >
                  {t('portalVehicleTitle')}
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">
                  {t('portalVehicleSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex border-b border-[rgba(26,23,20,0.1)]">
              {(['vin', 'manual'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => vehicle.selectTab(tab)}
                  className={`flex-1 py-3 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors border-b-2 ${
                    vehicle.entryTab === tab
                      ? 'border-[#c94318] text-[#1a1714]'
                      : 'border-transparent text-[#7a7269] hover:text-[#1a1714]'
                  }`}
                >
                  {tab === 'vin' ? t('vinTabVin') : t('vinTabManual')}
                </button>
              ))}
            </div>

            <div className="px-5 py-6">
              {vehicle.entryTab === 'vin' ? (
                <>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#7a7269] mb-3">
                    {t('vinInputLabel')}
                  </p>
                  <div className="flex gap-2 sm:gap-3 items-stretch">
                    <div className="flex-1 relative">
                      <input
                        value={vehicle.vinInput}
                        onChange={(e) => vehicle.changeVinInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') vehicle.decode()
                        }}
                        placeholder={t('vinInputPlaceholder')}
                        maxLength={17}
                        spellCheck={false}
                        className={`${INPUT_BASE} font-mono tracking-[0.1em] pr-14`}
                      />
                      <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums ${
                          vehicle.vinCharCount === 17 ? 'text-emerald-600' : 'text-[#7a7269]'
                        }`}
                      >
                        {vehicle.vinCharCount}/17
                      </span>
                    </div>
                    <button
                      onClick={() => vehicle.decode()}
                      disabled={!vehicle.canDecode}
                      className="px-4 sm:px-5 py-3 bg-[#1a1714] text-white text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                    >
                      {vehicle.decoding ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">{t('vinDecoding')}</span>
                        </>
                      ) : (
                        <>
                          <ScanLine className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('vinDecodeBtn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {vehicle.error && (
                    <p className="mt-2 text-[11px] font-mono text-red-600">{vehicle.error}</p>
                  )}
                  <p className="mt-4 text-[11px] font-mono text-[#7a7269]">{t('portalVinHelp')}</p>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-widest text-[#7a7269] block mb-1.5">
                        {t('vinBrand')}
                      </label>
                      <select
                        value={vehicle.manualBrand}
                        onChange={(e) => vehicle.selectBrand(e.target.value)}
                        aria-label={t('vinBrand')}
                        className={SELECT_BASE}
                      >
                        <option value="">{t('vinSelectBrand')}</option>
                        {CAR_BRANDS.filter((b) => b !== 'Unknown').map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-widest text-[#7a7269] block mb-1.5">
                        {t('vinModel')}
                      </label>
                      <select
                        value={vehicle.manualModel}
                        onChange={(e) => vehicle.selectModel(e.target.value)}
                        disabled={!vehicle.manualBrand}
                        aria-label={t('vinModel')}
                        className={SELECT_BASE}
                      >
                        <option value="">
                          {vehicle.manualBrand ? t('vinSelectModel') : t('vinSelectBrandFirst')}
                        </option>
                        {(CAR_MODELS[vehicle.manualBrand] ?? []).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        {vehicle.manualModel &&
                          !(CAR_MODELS[vehicle.manualBrand] ?? []).includes(vehicle.manualModel) && (
                            <option value={vehicle.manualModel}>{vehicle.manualModel}</option>
                          )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-widest text-[#7a7269] block mb-1.5">
                        {t('vinYear')}
                      </label>
                      <select
                        value={vehicle.manualYear}
                        onChange={(e) => vehicle.selectYear(e.target.value)}
                        disabled={!vehicle.manualModel}
                        aria-label={t('vinYear')}
                        className={`${SELECT_BASE} font-mono`}
                      >
                        <option value="">
                          {vehicle.manualModel ? t('vinSelectYear') : t('vinSelectModelFirst')}
                        </option>
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                        {vehicle.manualYear && !years.includes(vehicle.manualYear) && (
                          <option value={vehicle.manualYear}>{vehicle.manualYear}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  {vehicle.manualVehicle && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={vehicle.confirm}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1a1714] text-white text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        {t('vinShowServices')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-[#1a1714] px-5 py-3.5 mb-6 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-[#c94318] flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  className="text-lg font-bold uppercase tracking-tight text-white leading-none truncate"
                >
                  {toLookupVehicleLabel(activeVehicle)}
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">
                  {activeVehicle.vin
                    ? activeVehicle.vin
                    : activeVehicle.cylinders !== 'N/A'
                      ? `${activeVehicle.cylinders}-cylinder`
                      : t('portalManualEntry')}
                </p>
              </div>
            </div>
            <button
              onClick={vehicle.clear}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-white/60 hover:text-white text-[10px] font-mono uppercase tracking-widest transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">{t('portalChangeVehicle')}</span>
            </button>
          </div>
        )}

        {activeVehicle && (
          <>
            <div className={`bg-white ${BORDER} px-5 py-3.5 mb-5 flex items-center gap-3`}>
              <ClipboardList className="w-4 h-4 text-[#c94318] shrink-0" />
              <p className="text-sm text-[#1a1714]">{t('portalAllInclusive')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className={`flex items-center gap-2 bg-white ${BORDER} px-4 py-2.5 flex-1`}>
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

            {unavailable || Object.keys(grouped).length === 0 ? (
              <div className={`bg-white ${BORDER} p-16 text-center text-[#7a7269] font-mono text-sm`}>
                {unavailable ? UNAVAILABLE : t('noServicesFound')}
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
                  <div className={`bg-white ${BORDER} overflow-hidden`}>
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
          </>
        )}

        <div className="mt-8 p-4 border border-[rgba(26,23,20,0.1)] text-[12px] font-mono text-[#7a7269] text-center">
          {t('portalFooter')}
        </div>
      </div>
    </div>
  )
}
