import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import {
  Search, Plus, Zap, Edit2, Trash2, ShoppingCart, Tag,
} from "lucide-react";
import type { Part } from "../types/part";
import { StatusBadge } from "../utils/badge";
import { getStatus } from "../utils/status";
import { Modal } from "../shared/modal";
import { Input } from "../shared/input";
import { Select } from "../shared/select";
import { StockBar } from "../shared/stock-bar";
import { useLang, usePartName } from "../i18n/lang-context";
import { getPartNameSearchTerms } from "../i18n/part-names";
import { fmtCurrency, totalServicePrice } from "../utils/pricing";

let _id = 200;
const genId = (prefix: string) => `${prefix}${++_id}`;

const CATEGORIES = ["Engine", "Brakes", "Suspension", "Electrical", "Transmission"];

export default function Inventory({ parts, setParts, onQuickReorder }: {
  parts: Part[];
  setParts: Dispatch<SetStateAction<Part[]>>;
  onQuickReorder: (part: Part) => void;
}) {
  const t = useLang();
  const partName = usePartName();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editPart, setEditPart] = useState<Part | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const emptyForm = {
    sku: "", name: "", category: "Engine", stock: 0, threshold: 10, reorderQty: 25,
    unitPrice: 0, markupPct: 30, labourCost: 0, supplier: "", location: "", autoReorder: false,
  };
  const [form, setForm] = useState<Omit<Part, "id">>(emptyForm);

  const filtered = useMemo(() => {
    return parts.filter(p => {
      const q = search.toLowerCase();
      const nameTerms = getPartNameSearchTerms(p.sku, p.name);
      const matchSearch = !q
        || nameTerms.some(n => n.includes(q))
        || p.sku.toLowerCase().includes(q)
        || p.supplier.toLowerCase().includes(q);
      const matchCat = filterCat === "All" || p.category === filterCat;
      const matchStatus = filterStatus === "All" || getStatus(p) === filterStatus.toLowerCase();
      return matchSearch && matchCat && matchStatus;
    });
  }, [parts, search, filterCat, filterStatus]);

  function openAdd() { setForm(emptyForm); setShowAdd(true); }
  function openEdit(p: Part) {
    setForm({
      sku: p.sku, name: p.name, category: p.category, stock: p.stock, threshold: p.threshold,
      reorderQty: p.reorderQty, unitPrice: p.unitPrice, markupPct: p.markupPct, labourCost: p.labourCost,
      supplier: p.supplier, location: p.location, autoReorder: p.autoReorder,
    });
    setEditPart(p);
  }

  function save() {
    const data = {
      ...form,
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      reorderQty: Number(form.reorderQty),
      unitPrice: Number(form.unitPrice),
      markupPct: Number(form.markupPct),
      labourCost: Number(form.labourCost),
    };
    if (editPart) {
      setParts(ps => ps.map(p => p.id === editPart.id ? { ...p, ...data } : p));
      setEditPart(null);
    } else {
      setParts(ps => [...ps, { id: genId("p"), ...data }]);
      setShowAdd(false);
    }
  }

  const f = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const FormBody = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("fieldSku")} value={form.sku} onChange={v => f("sku", v)} placeholder="ENG-OIL-001" />
        <Input label={t("fieldPartName")} value={form.name} onChange={v => f("name", v)} placeholder="Oil Filter" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label={t("fieldCategory")} value={form.category} onChange={v => f("category", v)} options={CATEGORIES} />
        <Input label={t("fieldSupplier")} value={form.supplier} onChange={v => f("supplier", v)} placeholder="Bosch" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label={t("fieldStockQty")} value={form.stock} onChange={v => f("stock", v)} type="number" />
        <Input label={t("fieldAlertThreshold")} value={form.threshold} onChange={v => f("threshold", v)} type="number" />
        <Input label={t("fieldReorderQty")} value={form.reorderQty} onChange={v => f("reorderQty", v)} type="number" />
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Tag className="w-3 h-3" />{t("fieldPricingOwner")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Input label={t("fieldCostPrice")} value={form.unitPrice} onChange={v => f("unitPrice", v)} type="number" />
          <Input label={t("fieldMarkupPct")} value={form.markupPct} onChange={v => f("markupPct", v)} type="number" />
          <Input label={t("fieldLabourCost")} value={form.labourCost} onChange={v => f("labourCost", v)} type="number" />
        </div>
        {Number(form.unitPrice) > 0 && (
          <div className="mt-2 p-2.5 bg-background border border-border text-[11px] font-mono text-muted-foreground flex gap-4 flex-wrap">
            <span>{t("fieldPartsToCustomer")}: <span className="text-foreground">{fmtCurrency(Number(form.unitPrice) * (1 + Number(form.markupPct) / 100))}</span></span>
            <span>{t("fieldTotalService")}: <span className="text-foreground font-semibold">{fmtCurrency(Number(form.unitPrice) * (1 + Number(form.markupPct) / 100) + Number(form.labourCost))}</span></span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("fieldLocation")} value={form.location} onChange={v => f("location", v)} placeholder="A1-01" />
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
            <div
              className={`w-9 h-5 flex items-center border transition-colors ${form.autoReorder ? "bg-[#c94318] border-[#c94318]" : "bg-muted border-border"}`}
              onClick={() => setForm(p => ({ ...p, autoReorder: !p.autoReorder }))}
            >
              <div className={`w-4 h-4 bg-white transition-transform mx-0.5 ${form.autoReorder ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-xs font-mono text-foreground">{t("fieldAutoReorder")}</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={save}
          className="flex-1 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
        >
          {editPart ? t("invSaveChanges") : t("invAddPart")}
        </button>
        <button
          onClick={() => { setEditPart(null); setShowAdd(false); }}
          className="px-4 py-2.5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {(editPart || showAdd) && (
        <Modal title={editPart ? t("invEditPart") : t("invAddNewPart")} onClose={() => { setEditPart(null); setShowAdd(false); }}>
          <FormBody />
        </Modal>
      )}

      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            {filtered.length} {t("invPartsOf")} {parts.length} {t("invParts")}
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-4xl font-bold uppercase tracking-tight text-foreground">
            {t("invTitle")}
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("invAddPart")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            placeholder={t("invSearchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 font-mono"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none appearance-none pr-8"
        >
          {["All", ...CATEGORIES].map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none appearance-none pr-8"
        >
          {["All", "ok", "low", "critical", "out"].map(s => (
            <option key={s} value={s}>{s === "All" ? t("invAllStatus") : s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-border">
              {[
                t("colSku"), t("colPartName"), t("colCategory"), t("colStock"), t("colThreshold"),
                t("colCostPrice"), t("colMarkup"), t("colLabour"), t("colCustomerPrice"),
                t("colSupplier"), t("colStatus"), "",
              ].map(h => (
                <th key={h || "actions"} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = getStatus(p);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-border last:border-0 hover:bg-background transition-colors ${status === "out" ? "bg-red-50/50" : status === "critical" ? "bg-orange-50/30" : ""}`}
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground whitespace-nowrap">{partName(p.sku, p.name)}</div>
                    {p.autoReorder && (
                      <span className="text-[10px] font-mono text-violet-600 flex items-center gap-0.5 mt-0.5">
                        <Zap className="w-2.5 h-2.5" />{t("autoReorderLabel")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{p.category}</td>
                  <td className="px-4 py-3 min-w-[110px]">
                    <StockBar stock={p.stock} threshold={p.threshold} />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground tabular-nums">{p.threshold}</td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums whitespace-nowrap">
                    <span className="text-[#c94318] font-semibold">{fmtCurrency(p.unitPrice)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground tabular-nums">{p.markupPct}%</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground tabular-nums whitespace-nowrap">{fmtCurrency(p.labourCost)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground tabular-nums whitespace-nowrap font-semibold">{fmtCurrency(totalServicePrice(p))}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{p.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-muted">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {status !== "ok" && (
                        <button onClick={() => onQuickReorder(p)} className="p-1.5 text-muted-foreground hover:text-[#c94318] transition-colors rounded-sm hover:bg-muted" title="Quick reorder">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setParts(ps => ps.filter(x => x.id !== p.id))} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-sm hover:bg-muted">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground font-mono text-sm">{t("noPartsFound")}</div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#c94318] inline-block" />
          {t("legendCostPrice")}
        </span>
        <span>{t("legendCustomerPrice")}</span>
      </div>
    </div>
  );
}
