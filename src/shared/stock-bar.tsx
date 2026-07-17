export function StockBar({ stock, threshold }: { stock: number; threshold: number }) {
  const max = Math.max(threshold * 2, stock, 1);
  const pct = Math.min((stock / max) * 100, 100);
  const color = stock === 0 ? "bg-red-500" : stock <= threshold * 0.5 ? "bg-orange-500" : stock <= threshold ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-none overflow-hidden">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-foreground w-8 text-right tabular-nums">{stock}</span>
    </div>
  );
}
