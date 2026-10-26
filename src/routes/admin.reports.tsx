import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, ErrorState, Loading, PageHeader, Panel } from "@/components/admin/ui";
import { orderService, rs } from "@/lib/scartigo/services";
import { useStore } from "@/lib/scartigo/use-store";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

type Range = "today" | "7" | "30" | "custom";
const iso = (d: Date) => d.toISOString().slice(0, 10);

function Reports() {
  const { data, loading, error, retry } = useStore(orderService.getAll);
  const [range, setRange] = useState<Range>("7");
  const [from, setFrom] = useState(iso(new Date(Date.now() - 6 * 864e5)));
  const [to, setTo] = useState(iso(new Date()));
  if (loading) return <><PageHeader title="Reports" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Reports" /><ErrorState onRetry={retry} /></>;

  const start = new Date(); start.setHours(0, 0, 0, 0);
  let end = new Date(start.getTime() + 864e5);
  if (range === "7") start.setDate(start.getDate() - 6);
  if (range === "30") start.setDate(start.getDate() - 29);
  if (range === "custom") { start.setTime(new Date(from + "T00:00").getTime()); end = new Date(new Date(to + "T00:00").getTime() + 864e5); }
  const orders = data.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= start.getTime() && t < end.getTime(); });

  const sales = orders.reduce((s, o) => s + o.total, 0);
  const prodMap = new Map<string, { name: string; units: number; revenue: number }>();
  const catMap = new Map<string, number>();
  orders.forEach((o) => o.items.forEach((i) => {
    const r = i.product.price * i.quantity * (1 - (i.product.discountPercentage ?? 0) / 100);
    const e = prodMap.get(i.product.id) ?? { name: i.product.name, units: 0, revenue: 0 };
    prodMap.set(i.product.id, { ...e, units: e.units + i.quantity, revenue: e.revenue + r });
    catMap.set(i.product.category, (catMap.get(i.product.category) ?? 0) + r);
  }));
  const top = [...prodMap.values()].sort((a, b) => b.units - a.units).slice(0, 5);
  const cats = [...catMap].map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }));
  const split = (["Card", "Cash"] as const).map((m) => ({ name: m, value: orders.filter((o) => o.paymentMethod === m).reduce((s, o) => s + o.total, 0) }));

  const exportCsv = () => {
    const rows = [["Order ID", "Date", "Payment method", "Status", "Subtotal", "Discount", "Total"], ...orders.map((o) => [o.id, new Date(o.createdAt).toLocaleString("en-GB"), o.paymentMethod, o.status, o.subtotal, o.discount, o.total])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `scartigo-orders-${iso(new Date())}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const ranges: [Range, string][] = [["today", "Today"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["custom", "Custom"]];
  return (
    <>
      <PageHeader title="Reports" action={<Button className="h-11" onClick={exportCsv} disabled={!orders.length}><Download className="size-4" />Export CSV</Button>} />
      <div className="mb-4 flex flex-wrap items-end gap-2" role="group" aria-label="Date range">
        {ranges.map(([k, l]) => <Button key={k} variant={range === k ? "default" : "outline"} className="h-11" aria-pressed={range === k} onClick={() => setRange(k)}>{l}</Button>)}
        {range === "custom" && <>
          <label className="text-sm">From<Input type="date" className="h-11" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="text-sm">To<Input type="date" className="h-11" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
        </>}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Total Sales", rs(sales)], ["Total Orders", orders.length], ["Total Discount Given", rs(orders.reduce((s, o) => s + o.discount, 0))], ["Average Order Value", rs(orders.length ? sales / orders.length : 0)]].map(([l, v]) => (
          <Panel key={l}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 text-2xl font-bold">{v}</p></Panel>
        ))}
      </div>
      {orders.length === 0 ? <Panel className="mt-4"><Empty message="No orders found for this period." /></Panel> : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel className="lg:col-span-2"><h2 className="mb-3 font-semibold">Top 5 selling products</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th className="py-2">Product</th><th>Units</th><th>Revenue</th></tr></thead>
                <tbody>{top.map((p) => <tr key={p.name} className="h-11 border-t"><td>{p.name}</td><td>{p.units}</td><td>{rs(p.revenue)}</td></tr>)}</tbody></table></div>
              <div className="h-56"><ResponsiveContainer><BarChart data={top} layout="vertical"><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" width={110} fontSize={12} /><Tooltip /><Bar dataKey="units" name="Units" fill="var(--chart-1)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>
            </div>
          </Panel>
          <Panel><h2 className="mb-3 font-semibold">Sales by category</h2>
            <div className="h-64"><ResponsiveContainer><BarChart data={cats}><XAxis dataKey="category" fontSize={12} /><YAxis fontSize={12} width={60} /><Tooltip formatter={(v: number) => rs(v)} /><Bar dataKey="revenue" fill="var(--chart-2)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </Panel>
          <Panel><h2 className="mb-3 font-semibold">Card vs Cash</h2>
            <div className="h-64"><ResponsiveContainer><PieChart><Pie data={split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} isAnimationActive={false}>{split.map((_, i) => <Cell key={i} fill={i ? "var(--chart-2)" : "var(--chart-1)"} />)}</Pie><Tooltip formatter={(v: number) => rs(v)} /><Legend /></PieChart></ResponsiveContainer></div>
          </Panel>
        </div>)}
    </>
  );
}
