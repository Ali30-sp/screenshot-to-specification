import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Banknote, Package, Receipt } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge, Empty, ErrorState, fmtDate, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { orderService, productService, rs, type Product } from "@/lib/scartigo/services";
import { useStore } from "@/lib/scartigo/use-store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data, loading, error, retry } = useStore(() => ({ orders: orderService.getAll(), products: productService.getAll() }));
  const [edit, setEdit] = useState<Product | null>(null);
  if (loading) return <><PageHeader title="Dashboard" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Dashboard" /><ErrorState onRetry={retry} /></>;
  const { orders, products } = data;
  const today = new Date().toDateString();
  const low = products.filter((p) => p.stock < 10);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en-GB", { weekday: "short" }), sales: orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((s, o) => s + o.total, 0) };
  });
  const stats = [
    { label: "Today's Sales", value: rs(orders.filter((o) => new Date(o.createdAt).toDateString() === today).reduce((s, o) => s + o.total, 0)), icon: Banknote },
    { label: "Total Orders", value: orders.length, icon: Receipt },
    { label: "Total Products", value: products.length, icon: Package },
    { label: "Low Stock", value: low.length, icon: AlertTriangle },
  ];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your store at a glance" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{s.label}</p><s.icon className="size-5 text-primary" /></div><p className="mt-2 text-2xl font-bold">{s.value}</p></Panel>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2"><h2 className="mb-3 font-semibold">Weekly sales</h2>
          <div className="h-64"><ResponsiveContainer><BarChart data={week}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={12} /><YAxis fontSize={12} width={60} /><Tooltip formatter={(v: number) => rs(v)} /><Bar dataKey="sales" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel><h2 className="mb-3 font-semibold">Low stock alerts</h2>
          {low.length === 0 ? <Empty message="All products are well stocked." /> : (
            <ul className="divide-y">{low.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2"><div><p className="text-sm font-medium">{p.name}</p><Badge t="red">{p.stock} left</Badge></div><Button variant="outline" className="h-11" onClick={() => setEdit(p)}>Restock</Button></li>
            ))}</ul>)}
        </Panel>
      </div>
      <Panel className="mt-4"><h2 className="mb-3 font-semibold">Recent orders</h2>
        {orders.length === 0 ? <Empty message="No orders yet." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">Order ID</th><th>Date</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted"><td className="py-1"><Link to="/admin/orders" search={{ id: o.id }} className="flex h-11 items-center font-medium underline-offset-2 hover:underline">{o.id}</Link></td><td>{fmtDate(o.createdAt)}</td><td>{o.paymentMethod}</td><td>{rs(o.total)}</td><td><StatusBadge s={o.status} /></td></tr>
            ))}</tbody></table></div>)}
      </Panel>
      <ProductForm open={!!edit} product={edit} onClose={() => setEdit(null)} />
    </>
  );
}
