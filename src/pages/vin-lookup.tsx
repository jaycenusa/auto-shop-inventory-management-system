import { useMemo, useRef, useState } from "react";
import {
  Car, Check, ChevronRight, Cpu, RefreshCw, ScanLine, Search, ShoppingCart, X,
} from "lucide-react";
import {
  CAR_BRANDS, CAR_MODELS, CATEGORIES, SAMPLE_VINS, vehicleYears,
} from "../constant/vehicles";
import { useLang, usePartName } from "../i18n/lang-context";
import { useVehicleIdentification } from "../hooks/use-vehicle-identification";
import { StockBar } from "../shared/stock-bar";
import type { Part } from "../types/part";
import { StatusBadge } from "../utils/badge";
import { fmtCurrency, totalServicePrice } from "../utils/pricing";
import { getStatus } from "../utils/status";
import { UNAVAILABLE } from "../utils/unavailable";
import { filterLookupParts, toLookupVehicleLabel } from "../utils/vin-lookup";

const INPUT_BASE =
  "w-full bg-white/8 border border-white/15 px-4 py-3.5 text-white placeholder:text-white/25 font-mono text-sm focus:outline-none focus:border-[#c94318] focus:bg-white/10 transition-colors";
const SELECT_BASE = `${INPUT_BASE} appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`;

export default function VinLookup({ parts, unavailable, onQuickReorder }: {
  parts: Part[];
  unavailable: boolean;
  onQuickReorder: (part: Part) => void;
}) {
  const t = useLang();
  const partName = usePartName();
  const years = useMemo(() => vehicleYears(), []);
  const vehicle = useVehicleIdentification();

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [reorderedId, setReorderedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeVehicle = vehicle.activeVehicle;

  const filtered = useMemo(
    () => filterLookupParts(parts, { search, category: filterCat, inStockOnly }),
    [parts, search, filterCat, inStockOnly],
  );

  function clear() {
    vehicle.clear();
    setSearch("");
    setFilterCat("All");
    inputRef.current?.focus();
  }

  function handleReorder(part: Part) {
    onQuickReorder(part);
    setReorderedId(part.id);
    setTimeout(() => setReorderedId(null), 1500);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!activeVehicle ? (
        <div className="shrink-0 bg-[#1a1714] px-4 sm:px-8 py-6 sm:py-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ScanLine className="w-4 h-4 text-[#c94318]" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">{t("navVinLookup")}</p>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-6">
              {t("vinTitle")}
            </h1>

            <div className="flex border-b border-white/10 mb-6">
              {(["vin", "manual"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => vehicle.selectTab(tab)}
                  className={`flex-1 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors border-b-2 ${vehicle.entryTab === tab ? "border-[#c94318] text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
                >
                  {tab === "vin" ? t("vinTabVin") : t("vinTabManual")}
                </button>
              ))}
            </div>

            {vehicle.entryTab === "vin" ? (
              <>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2">{t("vinInputLabel")}</label>
                <div className="flex gap-2 sm:gap-3 items-stretch">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={vehicle.vinInput}
                      onChange={e => vehicle.changeVinInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") vehicle.decode(); }}
                      placeholder={t("vinInputPlaceholder")}
                      maxLength={17}
                      spellCheck={false}
                      className={`${INPUT_BASE} tracking-[0.12em] pr-16`}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums ${vehicle.vinCharCount === 17 ? "text-emerald-400" : "text-white/25"}`}>
                      {vehicle.vinCharCount}/17
                    </span>
                  </div>
                  <button
                    onClick={() => vehicle.decode()}
                    disabled={!vehicle.canDecode}
                    className="px-4 sm:px-6 py-3.5 bg-[#c94318] text-white text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#a33512] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {vehicle.decoding
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /><span className="hidden sm:inline">{t("vinDecoding")}</span></>
                      : <><ScanLine className="w-4 h-4" /><span className="hidden sm:inline">{t("vinDecodeBtn")}</span></>}
                  </button>
                </div>
                {vehicle.error && <p className="mt-2 text-[11px] font-mono text-red-400">{vehicle.error}</p>}

                {vehicle.recent.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">{t("vinRecentVins")}</p>
                    <div className="flex gap-2 flex-wrap">
                      {vehicle.recent.map(entry => (
                        <button
                          key={entry.vin}
                          onClick={() => vehicle.selectRecent(entry)}
                          className="flex items-center gap-2 px-3 py-1.5 border border-white/15 hover:border-white/35 transition-colors group"
                        >
                          <Car className="w-3 h-3 text-white/30 group-hover:text-white/60" />
                          <span className="text-[11px] font-mono text-white/50 group-hover:text-white/80">{toLookupVehicleLabel(entry)}</span>
                          <span className="text-[10px] font-mono text-white/25 group-hover:text-white/40">{entry.vin.slice(-6)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1.5">{t("vinBrand")}</label>
                    <select
                      value={vehicle.manualBrand}
                      onChange={e => vehicle.selectBrand(e.target.value)}
                      aria-label={t("vinBrand")}
                      className={SELECT_BASE}
                    >
                      <option value="">{t("vinSelectBrand")}</option>
                      {CAR_BRANDS.filter(b => b !== "Unknown").map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1.5">{t("vinModel")}</label>
                    <select
                      value={vehicle.manualModel}
                      onChange={e => vehicle.selectModel(e.target.value)}
                      disabled={!vehicle.manualBrand}
                      aria-label={t("vinModel")}
                      className={SELECT_BASE}
                    >
                      <option value="">{vehicle.manualBrand ? t("vinSelectModel") : t("vinSelectBrandFirst")}</option>
                      {(CAR_MODELS[vehicle.manualBrand] ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                      {vehicle.manualModel && !(CAR_MODELS[vehicle.manualBrand] ?? []).includes(vehicle.manualModel) && (
                        <option value={vehicle.manualModel}>{vehicle.manualModel}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1.5">{t("vinYear")}</label>
                    <select
                      value={vehicle.manualYear}
                      onChange={e => vehicle.selectYear(e.target.value)}
                      disabled={!vehicle.manualModel}
                      aria-label={t("vinYear")}
                      className={SELECT_BASE}
                    >
                      <option value="">{vehicle.manualModel ? t("vinSelectYear") : t("vinSelectModelFirst")}</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
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
                      className="flex items-center gap-2 px-6 py-3 bg-[#c94318] text-white text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#a33512] transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      {t("vinShowServices")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="shrink-0 sticky top-0 z-10 bg-[#1a1714] border-b border-white/10 px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#c94318] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-white/40">{t("vinVehicleCard")}</span>
                  {activeVehicle.vin && (
                    <>
                      <span className="text-[10px] font-mono text-white/30 hidden sm:inline">·</span>
                      <span className="text-[10px] font-mono text-white/40 hidden sm:inline truncate">{activeVehicle.vin}</span>
                    </>
                  )}
                </div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-none">
                  {toLookupVehicleLabel(activeVehicle)}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              {activeVehicle.cylinders !== "N/A" && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                  <Cpu className="w-3 h-3 text-white/30" />
                  <span>{activeVehicle.cylinders}-cylinder</span>
                </div>
              )}
              <button
                onClick={clear}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-white/50 hover:text-white/80 text-[10px] font-mono uppercase tracking-widest transition-colors"
              >
                <RefreshCw className="w-3 h-3" /><span className="hidden sm:inline">{t("vinClearBtn")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!activeVehicle ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8 pb-16">
            <div className={`w-20 h-20 flex items-center justify-center ${vehicle.decoding ? "bg-[#c94318]/10" : "bg-muted"}`}>
              {vehicle.decoding
                ? <RefreshCw className="w-10 h-10 text-[#c94318] animate-spin" />
                : <ScanLine className="w-10 h-10 text-muted-foreground opacity-30" />}
            </div>
            <p className="text-muted-foreground font-mono text-sm max-w-xs">
              {vehicle.decoding ? t("vinQuerying") : t("vinNoVehicle")}
            </p>
            {!vehicle.decoding && (
              <div className="text-[11px] font-mono text-muted-foreground space-y-1 bg-muted/50 border border-border px-4 py-3 text-left">
                <p className="font-semibold text-foreground mb-1">{t("vinSampleTitle")}</p>
                {SAMPLE_VINS.map(sample => (
                  <button
                    key={sample.vin}
                    onClick={() => vehicle.decode(sample.vin)}
                    className="flex items-center gap-2 hover:text-foreground transition-colors w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-[#c94318]" />
                    <span className="text-[#c94318] tracking-widest">{sample.vin}</span>
                    <span className="text-muted-foreground">— {sample.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-8">
            <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-xl font-bold uppercase tracking-wide text-foreground">
                  {t("vinPartsFor")} {toLookupVehicleLabel(activeVehicle)}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  {unavailable ? UNAVAILABLE : `${filtered.length} ${t("vinPartsOf")} ${parts.length} ${t("vinPartsShown")}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInStockOnly(v => !v)}
                aria-pressed={inStockOnly}
                className="flex items-center gap-1.5 select-none"
              >
                <span className={`w-8 h-4 flex items-center border transition-colors ${inStockOnly ? "bg-[#c94318] border-[#c94318]" : "bg-muted border-border"}`}>
                  <span className={`w-3 h-3 bg-white transition-transform mx-0.5 ${inStockOnly ? "translate-x-4" : "translate-x-0"}`} />
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">{t("vinInStockOnly")}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1 basis-full lg:basis-0 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  placeholder={t("vinSearchPlaceholder")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 font-mono"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-1 gap-1 min-w-[200px]">
                {["All", ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`flex-1 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest whitespace-nowrap transition-colors border ${filterCat === cat ? "bg-foreground text-primary-foreground border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {cat === "All" ? t("portalAll") : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      t("colSku"), t("vinColPart"), t("colCategory"), t("colStock"),
                      t("colCostPrice"), t("colMarkup"), t("colLabour"),
                      t("colCustomerPrice"), t("colStatus"), "",
                    ].map(h => (
                      <th key={h || "actions"} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!unavailable && filtered.map(p => {
                    const status = getStatus(p);
                    const justReordered = reorderedId === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-border last:border-0 hover:bg-background transition-colors ${status === "out" ? "bg-red-50/40" : status === "critical" ? "bg-orange-50/20" : ""}`}
                      >
                        <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{p.sku}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-foreground">{partName(p.sku, p.name)}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{p.supplier} · {p.location}</p>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{p.category}</td>
                        <td className="px-4 py-3 min-w-[90px]"><StockBar stock={p.stock} threshold={p.threshold} /></td>
                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                          <span className="text-[#c94318] font-semibold">{fmtCurrency(p.unitPrice)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground tabular-nums">{p.markupPct}%</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground tabular-nums whitespace-nowrap">{fmtCurrency(p.labourCost)}</td>
                        <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground tabular-nums whitespace-nowrap">{fmtCurrency(totalServicePrice(p))}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleReorder(p)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest border transition-colors whitespace-nowrap ${justReordered ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-foreground border-foreground text-primary-foreground hover:bg-[#c94318] hover:border-[#c94318]"}`}
                          >
                            {justReordered ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                            {t("order")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(unavailable || filtered.length === 0) && (
                <div className="py-16 text-center text-muted-foreground font-mono text-sm">
                  {unavailable ? UNAVAILABLE : t("noPartsFound")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
