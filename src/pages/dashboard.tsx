import { useMemo } from "react";
import { ChevronRight, ShoppingCart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import type { Customer } from "../types/customer";
import type { Part } from "../types/part";
import type { ReorderEntry } from "../types/reorder-entry";
import type { View } from "../types/view";
import { StatusBadge } from "../utils/badge";
import { getStatus } from "../utils/status";
import { StockBar } from "../shared/stock-bar";
import { useLang, usePartName } from "../i18n/lang-context";
import { fmtCurrency } from "../utils/pricing";

export default function Dashboard({ parts, customers, reorders, onNav }: {
  parts: Part[]; customers: Customer[]; reorders: ReorderEntry[];
  onNav: (v: View) => void;
}) {
  const t = useLang();
  const partName = usePartName();
  const alertCount = parts.filter(p => getStatus(p) !== "ok").length;
  const outCount = parts.filter(p => getStatus(p) === "out").length;
  const pendingReorders = reorders.filter(r => r.status === "pending" || r.status === "ordered").length;
  const stockCostValue = parts.reduce((s, p) => s + p.stock * p.unitPrice, 0);
  const activeCustomers = customers.filter(c => c.status === "active").length;

  const categoryData = useMemo(() => {
    const cats: Record<string, { stock: number; alerts: number }> = {};
    parts.forEach(p => {
      if (!cats[p.category]) cats[p.category] = { stock: 0, alerts: 0 };
      cats[p.category].stock += p.stock;
      if (getStatus(p) !== "ok") cats[p.category].alerts++;
    });
    return Object.entries(cats).map(([cat, d]) => ({ cat, stock: d.stock, alerts: d.alerts }));
  }, [parts]);

  const criticalParts = parts.filter(p => getStatus(p) === "out" || getStatus(p) === "critical").slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("dashOverview")} — July 14, 2026</p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-4xl font-bold uppercase tracking-tight text-foreground">
          {t("dashTitle")}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("dashTotalParts"), value: parts.length.toString(), sub: `${parts.filter(p=>p.autoReorder).length} ${t("dashAutoReorderActive")}`, color: "" },
          { label: t("dashStockAlerts"), value: alertCount.toString(), sub: `${outCount} ${t("dashOutOfStock")}`, color: alertCount > 0 ? "border-l-4 border-l-[#c94318]" : "" },
          { label: t("dashPendingReorders"), value: pendingReorders.toString(), sub: t("dashAwaitingFulfillment"), color: pendingReorders > 0 ? "border-l-4 border-l-blue-500" : "" },
          { label: t("dashStockCostValue"), value: fmtCurrency(stockCostValue), sub: `${activeCustomers} ${t("dashActiveCustomers")}`, color: "" },
        ].map(card => (
          <div key={card.label} className={`bg-card border border-border p-5 ${card.color}`}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{card.label}</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground mb-5">
            {t("dashStockByCategory")}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} barSize={28}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(26,23,20,0.07)" vertical={false} />
              <XAxis dataKey="cat" tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: "#7a7269" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fill: "#7a7269" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#f8f6f2", border: "1px solid rgba(26,23,20,0.12)", borderRadius: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                cursor={{ fill: "rgba(26,23,20,0.04)" }}
              />
              <Bar dataKey="stock" name={t("dashTotalStock")} fill="#1a1714" radius={0} />
              <Bar dataKey="alerts" name={t("dashAlerts")} fill="#c94318" radius={0} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <span className="w-3 h-2.5 bg-[#1a1714] inline-block" />{t("dashTotalStock")}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <span className="w-3 h-2.5 bg-[#c94318] inline-block" />{t("dashAlerts")}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              {t("dashNeedsAttention")}
            </p>
            <button
              onClick={() => onNav("alerts")}
              className="text-[11px] font-mono text-[#c94318] hover:text-[#a33512] transition-colors flex items-center gap-0.5"
            >
              {t("dashViewAll")} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {criticalParts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground font-mono">{t("dashAllStockOK")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalParts.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{partName(p.sku, p.name)}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{p.sku}</p>
                  </div>
                  <StatusBadge status={getStatus(p)} />
                </div>
              ))}
            </div>
          )}
          {criticalParts.length > 0 && (
            <button
              onClick={() => onNav("reorders")}
              className="mt-5 w-full py-2 bg-[#c94318] text-white text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#a33512] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {t("dashCreateReorders")}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border p-6">
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground mb-4">
          {t("dashAutoReorderEnabled")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {parts.filter(p => p.autoReorder).map(p => (
            <div key={p.id} className="p-3 bg-background border border-border">
              <p className="text-[10px] font-mono text-muted-foreground">{p.sku}</p>
              <p className="text-sm font-medium text-foreground mt-0.5 truncate">{partName(p.sku, p.name)}</p>
              <div className="mt-2">
                <StockBar stock={p.stock} threshold={p.threshold} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
