import { useMemo, useState } from "react";
import {
  LayoutDashboard, Package, AlertTriangle, RotateCcw, Users,
  Bell, ChevronRight, ScanLine,
} from "lucide-react";
import type { Part } from "./types/part";
import type { View } from "./types/view";
import { getStatus } from "./utils/status";
import { fmtCurrency } from "./utils/pricing";
import { resolveAppMode, isDevPreviewHost } from "./utils/resolve-app-mode";
import type { AppMode } from "./types/app-mode";
import { Modal } from "./shared/modal";
import { Input } from "./shared/input";
import Dashboard from "./pages/dashboard";
import Inventory from "./pages/inventory";
import VinLookup from "./pages/vin-lookup";
import CustomerPage from "./pages/customer-page";
import CustomerPortal from "./pages/customer-portal";
import Alerts from "./components/alerts";
import Reorders from "./components/reorders";
import { SiteBanner } from "./components/mode-switcher-banner";
import { LangCtx, CurrentLangCtx, createTranslator, useLang, usePartName, type Lang } from "./i18n/lang-context";
import { useParts } from "./hooks/use-parts";
import { useCustomers } from "./hooks/use-customers";
import { useReorders } from "./hooks/use-reorders";
import { resolveViewRequestKeys } from "./hooks/resolve-view-request-keys";

function OwnerApp() {
  const t = useLang();
  const partName = usePartName();
  const [view, setView] = useState<View>("dashboard");
  const [reorderTarget, setReorderTarget] = useState<Part | null>(null);
  const [reorderQty, setReorderQty] = useState("");
  const [reorderSubmitting, setReorderSubmitting] = useState(false);

  const requestKeys = useMemo(() => resolveViewRequestKeys(view), [view]);

  const {
    parts,
    loading: partsLoading,
    error: partsError,
    create: createPart,
    update: updatePart,
  } = useParts({ requestKey: requestKeys.parts });
  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomers({ requestKey: requestKeys.customers });
  const {
    reorders,
    loading: reordersLoading,
    error: reordersError,
    create: createReorder,
    updateStatus: updateReorderStatus,
  } = useReorders({ requestKey: requestKeys.reorders });

  const alertCount = parts.filter(p => getStatus(p) !== "ok").length;
  const pendingCount = reorders.filter(r => r.status === "pending" || r.status === "ordered").length;

  const activeLoading =
    (requestKeys.parts != null && partsLoading) ||
    (requestKeys.customers != null && customersLoading) ||
    (requestKeys.reorders != null && reordersLoading);

  const partsUnavailable = requestKeys.parts != null && !!partsError;
  const customersUnavailable = requestKeys.customers != null && !!customersError;
  const reordersUnavailable = requestKeys.reorders != null && !!reordersError;

  function quickReorder(p: Part) {
    setReorderTarget(p);
    setReorderQty(p.reorderQty.toString());
  }

  async function submitQuickReorder() {
    if (!reorderTarget || reorderSubmitting) return;
    setReorderSubmitting(true);
    try {
      await createReorder({
        partId: reorderTarget.id,
        quantity: Number(reorderQty) || reorderTarget.reorderQty,
        supplier: reorderTarget.supplier,
        unitCost: reorderTarget.unitPrice,
        type: "manual",
      });
      setReorderTarget(null);
    } finally {
      setReorderSubmitting(false);
    }
  }

  const NAV = [
    { id: "dashboard" as View, label: t("navDashboard"), Icon: LayoutDashboard },
    { id: "vinlookup" as View, label: t("navVinLookup"), Icon: ScanLine },
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
                onClick={() => void submitQuickReorder()}
                disabled={reorderSubmitting}
                className="flex-1 py-2.5 bg-foreground text-primary-foreground text-[11px] font-mono font-semibold uppercase tracking-widest hover:bg-[#c94318] transition-colors disabled:opacity-40"
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

      {/* VIN Lookup scrolls its own parts panel, so main must not also scroll. */}
      <main className={`flex-1 min-h-0 min-w-0 bg-background ${view === "vinlookup" ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
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

        {activeLoading && (
          <div className="flex items-center justify-center py-24 text-sm font-mono text-muted-foreground">
            Loading…
          </div>
        )}

        {!activeLoading && (
          <>
            {view === "dashboard" && (
              <Dashboard
                parts={parts}
                customers={customers}
                reorders={reorders}
                unavailable={{
                  parts: partsUnavailable,
                  customers: customersUnavailable,
                  reorders: reordersUnavailable,
                }}
                onNav={setView}
              />
            )}
            {view === "inventory" && (
              <Inventory
                parts={parts}
                unavailable={partsUnavailable}
                createPart={createPart}
                updatePart={updatePart}
                onQuickReorder={quickReorder}
              />
            )}
            {view === "vinlookup" && (
              <VinLookup
                parts={parts}
                unavailable={partsUnavailable}
                onQuickReorder={quickReorder}
              />
            )}
            {view === "alerts" && (
              <Alerts
                parts={parts}
                unavailable={partsUnavailable}
                onReorder={quickReorder}
              />
            )}
            {view === "reorders" && (
              <Reorders
                parts={parts}
                reorders={reorders}
                unavailable={{
                  parts: partsUnavailable,
                  reorders: reordersUnavailable,
                }}
                createReorder={createReorder}
                updateReorderStatus={updateReorderStatus}
              />
            )}
            {view === "customers" && (
              <CustomerPage
                customers={customers}
                unavailable={customersUnavailable}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CustomerModeApp() {
  const { parts, loading, error } = useParts({ requestKey: "customer-portal" });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm font-mono text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto">
      <CustomerPortal parts={parts} unavailable={!!error} />
    </div>
  );
}

export default function App() {
  const canSwitchModes = isDevPreviewHost();
  const resolvedMode = resolveAppMode();
  const [mode, setMode] = useState<AppMode>(resolvedMode);
  const [lang, setLang] = useState<Lang>("en");

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

          {activeMode === "customer" ? <CustomerModeApp /> : <OwnerApp />}
        </div>
      </CurrentLangCtx.Provider>
    </LangCtx.Provider>
  );
}
