import { useState } from "react";
import {
  LayoutDashboard, Package, AlertTriangle, RotateCcw, Users,
  Bell, ChevronRight,
} from "lucide-react";
import type { Customer } from "./types/customer";
import type { Part } from "./types/part";
import type { ReorderEntry } from "./types/reorder-entry";
import type { View } from "./types/view";
import { SEED_CUSTOMERS } from "./constant/seed_customers";
import { SEED_PARTS } from "./constant/seed_parts";
import { SEED_REORDERS } from "./constant/seed_reorders";
import { getStatus } from "./utils/status";
import { fmtCurrency } from "./utils/pricing";
import { resolveAppMode, isDevPreviewHost } from "./utils/resolve-app-mode";
import type { AppMode } from "./types/app-mode";
import { Modal } from "./shared/modal";
import { Input } from "./shared/input";
import Dashboard from "./pages/dashboard";
import Inventory from "./pages/inventory";
import CustomerPage from "./pages/customer-page";
import CustomerPortal from "./pages/customer-portal";
import Alerts from "./components/alerts";
import Reorders from "./components/reorders";
import { SiteBanner } from "./components/mode-switcher-banner";
import { LangCtx, CurrentLangCtx, createTranslator, useLang, usePartName, type Lang } from "./i18n/lang-context";

let _id = 200;
const genId = (prefix: string) => `${prefix}${++_id}`;
const TODAY = "2026-07-14";

function OwnerApp({
  parts, setParts, customers, reorders, setReorders,
}: {
  parts: Part[];
  setParts: React.Dispatch<React.SetStateAction<Part[]>>;
  customers: Customer[];
  reorders: ReorderEntry[];
  setReorders: React.Dispatch<React.SetStateAction<ReorderEntry[]>>;
}) {
  const t = useLang();
  const partName = usePartName();
  const [view, setView] = useState<View>("dashboard");
  const [reorderTarget, setReorderTarget] = useState<Part | null>(null);
  const [reorderQty, setReorderQty] = useState("");

  const alertCount = parts.filter(p => getStatus(p) !== "ok").length;
  const pendingCount = reorders.filter(r => r.status === "pending" || r.status === "ordered").length;

  function quickReorder(p: Part) {
    setReorderTarget(p);
    setReorderQty(p.reorderQty.toString());
  }

  function submitQuickReorder() {
    if (!reorderTarget) return;
    setReorders(rs => [{
      id: genId("r"),
      partId: reorderTarget.id,
      partSku: reorderTarget.sku,
      partName: reorderTarget.name,
      quantity: Number(reorderQty) || reorderTarget.reorderQty,
      supplier: reorderTarget.supplier,
      unitCost: reorderTarget.unitPrice,
      status: "pending",
      type: "manual",
      createdAt: TODAY,
    }, ...rs]);
    setReorderTarget(null);
  }

  const NAV = [
    { id: "dashboard" as View, label: t("navDashboard"), Icon: LayoutDashboard },
    { id: "inventory" as View, label: t("navInventory"), Icon: Package },
    { id: "alerts" as View, label: t("navAlerts"), Icon: AlertTriangle },
    { id: "reorders" as View, label: t("navReorders"), Icon: RotateCcw },
    { id: "customers" as View, label: t("navCustomers"), Icon: Users },
  ];

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {reorderTarget && (
        <Modal title={`${t("reorderCreateReorder")} — ${partName(reorderTarget.sku, reorderTarget.name)}`} onClose={() => setReorderTarget(null)}>
          <div className="space-y-4">
            <div className="bg-background border border-border p-3 text-xs font-mono text-muted-foreground space-y-1">
              <div>SKU: <span className="text-foreground">{reorderTarget.sku}</span></div>
              <div>{t("colSupplier")}: <span className="text-foreground">{reorderTarget.supplier}</span></div>
              <div>{t("reorderStockLabel")}: <span className="text-foreground">{reorderTarget.stock}</span> · {t("reorderThresholdLabel")}: <span className="text-foreground">{reorderTarget.threshold}</span></div>
              <div>{t("reorderCostLabel")}: <span className="text-[#c94318] font-semibold">{fmtCurrency(reorderTarget.unitPrice)}</span></div>
            </div>
            <Input label={t("colQty")} value={reorderQty} onChange={setReorderQty} type="number" />
            {reorderQty && (
              <p className="text-xs font-mono text-muted-foreground">
                {t("reorderTotalLabel")}: <span className="text-foreground font-semibold">{fmtCurrency(Number(reorderQty) * reorderTarget.unitPrice)}</span>
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={submitQuickReorder}
                className="flex-1 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors"
              >
                {t("reorderSubmit")}
              </button>
              <button onClick={() => setReorderTarget(null)} className="px-4 py-2.5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                {t("cancel")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <aside className="w-56 shrink-0 flex flex-col min-h-0 bg-[#1a1714] border-r border-white/8">
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c94318] flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-[15px] font-bold uppercase tracking-[0.15em] text-white leading-none">
                Auto Shop
              </p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mt-0.5">{t("ownerDashboard")}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2">
          {NAV.map(({ id, label, Icon }) => {
            const badge = id === "alerts" ? alertCount : id === "reorders" ? pendingCount : 0;
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 text-left transition-colors ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[12px] font-mono uppercase tracking-widest flex-1">{label}</span>
                {badge > 0 && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${id === "alerts" ? "bg-[#c94318] text-white" : "bg-white/20 text-white"}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>AD</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-white">Admin User</p>
              <p className="text-[9px] font-mono text-white/40">admin@autoshop.io</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-0 overflow-y-auto bg-background">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span>Auto Shop</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{NAV.find(n => n.id === view)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <button
                onClick={() => setView("alerts")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c94318]/10 border border-[#c94318]/30 text-[#c94318] text-[11px] font-mono font-semibold hover:bg-[#c94318]/20 transition-colors"
              >
                <Bell className="w-3 h-3" />
                {alertCount} {t("dashAlerts").toLowerCase()}
              </button>
            )}
          </div>
        </header>

        {view === "dashboard" && <Dashboard parts={parts} customers={customers} reorders={reorders} onNav={setView} />}
        {view === "inventory" && <Inventory parts={parts} setParts={setParts} onQuickReorder={quickReorder} />}
        {view === "alerts" && <Alerts parts={parts} onReorder={quickReorder} />}
        {view === "reorders" && <Reorders parts={parts} reorders={reorders} setReorders={setReorders} />}
        {view === "customers" && <CustomerPage customers={customers} />}
      </main>
    </div>
  );
}

export default function App() {
  const canSwitchModes = isDevPreviewHost();
  const resolvedMode = resolveAppMode();
  const [mode, setMode] = useState<AppMode>(resolvedMode);
  const [lang, setLang] = useState<Lang>("en");
  const [parts, setParts] = useState<Part[]>(SEED_PARTS);
  const [customers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [reorders, setReorders] = useState<ReorderEntry[]>(SEED_REORDERS);

  const activeMode = canSwitchModes ? mode : resolvedMode;
  const t = createTranslator(lang);

  return (
    <LangCtx.Provider value={t}>
      <CurrentLangCtx.Provider value={lang}>
        <div className="flex flex-col h-dvh max-h-dvh min-h-0 w-full overflow-hidden" style={{ fontFamily: "'Barlow', sans-serif" }}>
          <SiteBanner
            mode={activeMode}
            lang={lang}
            setLang={setLang}
            allowModeSwitch={canSwitchModes}
            onSwitchMode={() => setMode(m => (m === "owner" ? "customer" : "owner"))}
          />

          {activeMode === "customer" ? (
            <div className="flex-1 min-h-0 w-full overflow-y-auto">
              <CustomerPortal parts={parts} />
            </div>
          ) : (
            <OwnerApp
              parts={parts}
              setParts={setParts}
              customers={customers}
              reorders={reorders}
              setReorders={setReorders}
            />
          )}
        </div>
      </CurrentLangCtx.Provider>
    </LangCtx.Provider>
  );
}
