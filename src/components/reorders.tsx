import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus, X, Zap, Check } from "lucide-react";
import type { Part } from "../types/part";
import type { ReorderEntry, ReorderStatus } from "../types/reorder-entry";
import { ReorderBadge, TypeBadge } from "../utils/badge";
import { getStatus } from "../utils/status";
import { Modal } from "../shared/modal";
import { Input } from "../shared/input";
import { usePartName } from "../i18n/lang-context";

const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let _id = 200;
const genId = (prefix: string) => `${prefix}${++_id}`;

const TODAY = "2026-07-14";

export default function Reorders({ parts, reorders, setReorders }: {
  parts: Part[];
  reorders: ReorderEntry[];
  setReorders: Dispatch<SetStateAction<ReorderEntry[]>>;
}) {
  const partName = usePartName();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [showModal, setShowModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [qty, setQty] = useState("");
  const [autoRunDone, setAutoRunDone] = useState(false);

  const active = reorders.filter(r => r.status === "pending" || r.status === "ordered");
  const history = reorders.filter(r => r.status === "delivered" || r.status === "cancelled");
  const belowThreshold = parts.filter(p => getStatus(p) !== "ok" && p.autoReorder);

  function openCreate(part?: Part) {
    setSelectedPart(part || null);
    setQty(part ? part.reorderQty.toString() : "");
    setShowModal(true);
  }

  function createOrder() {
    if (!selectedPart) return;
    const newEntry: ReorderEntry = {
      id: genId("r"),
      partId: selectedPart.id,
      partSku: selectedPart.sku,
      partName: selectedPart.name,
      quantity: Number(qty) || selectedPart.reorderQty,
      supplier: selectedPart.supplier,
      unitCost: selectedPart.unitPrice,
      status: "pending",
      type: "manual",
      createdAt: TODAY,
    };
    setReorders(rs => [newEntry, ...rs]);
    setShowModal(false);
  }

  function runAutoReorder() {
    const newOrders: ReorderEntry[] = belowThreshold
      .filter(p => !reorders.some(r => r.partId === p.id && (r.status === "pending" || r.status === "ordered")))
      .map(p => ({
        id: genId("r"),
        partId: p.id,
        partSku: p.sku,
        partName: p.name,
        quantity: p.reorderQty,
        supplier: p.supplier,
        unitCost: p.unitPrice,
        status: "pending" as ReorderStatus,
        type: "auto" as const,
        createdAt: TODAY,
      }));
    setReorders(rs => [...newOrders, ...rs]);
    setAutoRunDone(true);
    setTimeout(() => setAutoRunDone(false), 3000);
  }

  function markStatus(id: string, status: ReorderStatus) {
    setReorders(rs => rs.map(r => r.id === id ? { ...r, status, deliveredAt: status === "delivered" ? TODAY : r.deliveredAt } : r));
  }

  const ReorderTable = ({ items }: { items: ReorderEntry[] }) => (
    <div className="bg-card border border-border overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border">
            {["SKU", "Part Name", "Supplier", "Qty", "Total Cost", "Type", "Date", "Status", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
              <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{r.partSku}</td>
              <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{partName(r.partSku, r.partName)}</td>
              <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.supplier}</td>
              <td className="px-4 py-3 text-xs font-mono text-foreground tabular-nums">{r.quantity}</td>
              <td className="px-4 py-3 text-xs font-mono text-foreground tabular-nums whitespace-nowrap">{fmtCurrency(r.quantity * r.unitCost)}</td>
              <td className="px-4 py-3"><TypeBadge type={r.type} /></td>
              <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{r.createdAt}</td>
              <td className="px-4 py-3 whitespace-nowrap"><ReorderBadge status={r.status} /></td>
              <td className="px-4 py-3">
                {r.status === "pending" && (
                  <div className="flex gap-1">
                    <button onClick={() => markStatus(r.id, "ordered")} className="px-2 py-1 text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">Order</button>
                    <button onClick={() => markStatus(r.id, "cancelled")} className="p-1 text-muted-foreground hover:text-red-600 transition-colors"><X className="w-3 h-3" /></button>
                  </div>
                )}
                {r.status === "ordered" && (
                  <button onClick={() => markStatus(r.id, "delivered")} className="px-2 py-1 text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">Mark Delivered</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <div className="py-12 text-center text-muted-foreground font-mono text-sm">No orders</div>}
    </div>
  );

  return (
    <div className="p-8">
      {showModal && (
        <Modal title="Create Reorder" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">part</label>
              <select
                value={selectedPart?.id || ""}
                onChange={e => {
                  const p = parts.find(x => x.id === e.target.value) || null;
                  setSelectedPart(p);
                  if (p) setQty(p.reorderQty.toString());
                }}
                className="bg-input-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">select a part…</option>
                {parts.map(p => <option key={p.id} value={p.id}>{partName(p.sku, p.name)} ({p.sku})</option>)}
              </select>
            </div>
            {selectedPart && (
              <div className="bg-background border border-border p-3 text-xs font-mono text-muted-foreground space-y-1">
                <div>Supplier: <span className="text-foreground">{selectedPart.supplier}</span></div>
                <div>Current stock: <span className="text-foreground">{selectedPart.stock}</span> · Threshold: <span className="text-foreground">{selectedPart.threshold}</span></div>
                <div>Unit cost: <span className="text-foreground">{fmtCurrency(selectedPart.unitPrice)}</span></div>
              </div>
            )}
            <Input label="Quantity" value={qty} onChange={setQty} type="number" />
            {selectedPart && qty && (
              <p className="text-xs font-mono text-muted-foreground">
                Estimated total: <span className="text-foreground font-semibold">{fmtCurrency(Number(qty) * (selectedPart?.unitPrice || 0))}</span>
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={createOrder}
                disabled={!selectedPart || !qty}
                className="flex-1 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Order
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            {active.length} active · {history.length} completed
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-4xl font-bold uppercase tracking-tight text-foreground">
            Reorder Center
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runAutoReorder}
            className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors border ${autoRunDone ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-card border-border text-foreground hover:border-[#c94318] hover:text-[#c94318]"}`}
          >
            {autoRunDone ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            {autoRunDone ? "Auto-orders created" : `Run Auto-Reorder (${belowThreshold.length})`}
          </button>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Manual Order
          </button>
        </div>
      </div>

      {/* Auto-Reorder Rules */}
      <div className="bg-card border border-border p-5 mb-6">
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground mb-3">
          Auto-Reorder Triggers — {parts.filter(p => p.autoReorder).length} rules active
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {parts.filter(p => p.autoReorder).map(p => {
            const st = getStatus(p);
            const triggered = st !== "ok";
            return (
              <div key={p.id} className={`p-2.5 border text-xs font-mono ${triggered ? "border-[#c94318] bg-orange-50" : "border-border bg-background"}`}>
                <div className="text-muted-foreground">{p.sku}</div>
                <div className="text-foreground font-medium truncate">{partName(p.sku, p.name)}</div>
                <div className={`mt-1 ${triggered ? "text-[#c94318]" : "text-muted-foreground"}`}>
                  {triggered ? `⚡ TRIGGER: ${p.stock} / ${p.threshold}` : `OK: ${p.stock} / ${p.threshold}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(["active", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-[11px] font-mono font-semibold uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "active" ? `Active Orders (${active.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      <ReorderTable items={tab === "active" ? active : history} />
    </div>
  );
}
