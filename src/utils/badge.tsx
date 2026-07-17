import { Zap } from "lucide-react";
import type { PartStatus } from "../types/part";
import type { ReorderStatus, ReorderType } from "../types/reorder-entry";
import { useLang } from "../i18n/lang-context";

export function StatusBadge({ status }: { status: PartStatus }) {
  const t = useLang();
  const cfg = {
    ok:       { label: t("statusOk"),       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    low:      { label: t("statusLow"),      cls: "bg-amber-50 text-amber-700 border-amber-200" },
    critical: { label: t("statusCritical"), cls: "bg-orange-50 text-orange-700 border-orange-200" },
    out:      { label: t("statusOut"),      cls: "bg-red-50 text-red-700 border-red-200" },
  }[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function ReorderBadge({ status }: { status: ReorderStatus }) {
  const t = useLang();
  const cfg = {
    pending:   { label: t("statusPending"),   cls: "bg-amber-50 text-amber-700 border-amber-200" },
    ordered:   { label: t("statusOrdered"),   cls: "bg-blue-50 text-blue-700 border-blue-200" },
    delivered: { label: t("statusDelivered"), cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: t("statusCancelled"), cls: "bg-stone-100 text-stone-400 border-stone-200" },
  }[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function TypeBadge({ type }: { type: ReorderType }) {
  const t = useLang();
  return type === "auto"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest bg-violet-50 text-violet-700 border border-violet-200"><Zap className="w-2.5 h-2.5" />{t("statusAuto")}</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest bg-stone-100 text-stone-600 border border-stone-200">{t("statusManual")}</span>;
}
