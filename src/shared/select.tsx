export function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-input-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
