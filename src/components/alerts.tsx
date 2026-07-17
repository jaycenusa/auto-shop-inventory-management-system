import { AlertTriangle, Zap, Check, ShoppingCart } from "lucide-react";
import type { Part } from "../types/part";
import { getStatus } from "../utils/status";
import { usePartName } from "../i18n/lang-context";

export default function Alerts({ parts, onReorder }: { parts: Part[]; onReorder: (p: Part) => void }) {
  const partName = usePartName();
  const out = parts.filter(p => getStatus(p) === "out");
  const critical = parts.filter(p => getStatus(p) === "critical");
  const low = parts.filter(p => getStatus(p) === "low");

  const AlertGroup = ({ title, items, color, bgColor }: { title: string; items: Part[]; color: string; bgColor: string }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className={`flex items-center gap-3 px-4 py-3 ${bgColor} border border-border mb-0`}>
          <AlertTriangle className={`w-4 h-4 ${color}`} />
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className={`text-sm font-bold uppercase tracking-[0.12em] ${color}`}>
            {title} — {items.length} {items.length === 1 ? "part" : "parts"}
          </p>
        </div>
        <div className="border border-t-0 border-border divide-y divide-border">
          {items.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3.5 bg-card hover:bg-background transition-colors">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{partName(p.sku, p.name)}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.sku} · {p.category} · {p.location}</p>
                </div>
                <div className="hidden sm:block text-xs font-mono text-muted-foreground">
                  Stock: <span className="text-foreground font-semibold">{p.stock}</span> / Threshold: {p.threshold}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.autoReorder && <span className="text-[10px] font-mono text-violet-600 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />auto</span>}
                <button
                  onClick={() => onReorder(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
          {out.length + critical.length + low.length} active alerts
        </p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-4xl font-bold uppercase tracking-tight text-foreground">
          Stock Alerts
        </h1>
      </div>

      {out.length === 0 && critical.length === 0 && low.length === 0 ? (
        <div className="bg-card border border-border p-16 text-center">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-xl font-semibold uppercase tracking-wide text-foreground">All stock levels healthy</p>
          <p className="text-sm text-muted-foreground mt-1 font-mono">No parts below reorder threshold</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AlertGroup
            title="Out of Stock"
            items={out}
            color="text-red-700"
            bgColor="bg-red-50"
          />
          <AlertGroup
            title="Critical — Below 50% Threshold"
            items={critical}
            color="text-orange-700"
            bgColor="bg-orange-50"
          />
          <AlertGroup
            title="Low Stock — Below Threshold"
            items={low}
            color="text-amber-700"
            bgColor="bg-amber-50"
          />
        </div>
      )}
    </div>
  );
}
