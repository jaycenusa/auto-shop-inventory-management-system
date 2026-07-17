import { useState } from "react";
import { Search } from "lucide-react";
import type { Customer } from "../types/customer";

const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CustomerPage({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setfilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchS = filterStatus === "all" || c.status === filterStatus;
    return matchQ && matchS;
  });

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
          {customers.filter(c => c.status === "active").length} active customers
        </p>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-4xl font-bold uppercase tracking-tight text-foreground">
          customers
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Customers", value: customers.length.toString() },
          { label: "Total Orders", value: totalOrders.toString() },
          { label: "Total Revenue", value: fmtCurrency(totalRevenue) },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            placeholder="Search by name, email, company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 font-mono"
          />
        </div>
        <div className="flex border border-border overflow-hidden">
          {(["all", "active", "inactive"] as const).map(s => (
            <button
              key={s}
              onClick={() => setfilterStatus(s)}
              className={`px-4 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors ${filterStatus === s ? "bg-foreground text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {["Customer", "Company", "Phone", "Orders", "Total Spent", "Last Order", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {c.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground whitespace-nowrap">{c.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{c.company}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{c.phone}</td>
                <td className="px-4 py-3 text-sm font-mono text-foreground tabular-nums">{c.totalOrders}</td>
                <td className="px-4 py-3 text-sm font-mono text-foreground tabular-nums whitespace-nowrap">{fmtCurrency(c.totalSpent)}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{c.lastOrder}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest border ${c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground font-mono text-sm">No customers found</div>}
      </div>
    </div>
  );
}
