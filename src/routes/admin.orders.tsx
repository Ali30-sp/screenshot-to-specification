import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Empty, ErrorState, fmtDate, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { orderService, rs, type Order } from "@/lib/scartigo/services";
import { useStore } from "@/lib/scartigo/use-store";

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (s: Record<string, unknown>): { id?: string | undefined } => ({ id: typeof s["id"] === "string" ? s["id"] : undefined }),
  component: Orders,
});

const STATUSES: Order["status"][] = ["Pending", "Paid", "Completed"];

function Orders() {
  const { id } = Route.useSearch();
  const nav = useNavigate({ from: "/admin/orders" });
  const { data, loading, error, retry } = useStore(orderService.getAll);
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [q, setQ] = useState("");
  if (loading) return <><PageHeader title="Orders" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Orders" /><ErrorState onRetry={retry} /></>;
  const s = q.trim().toLowerCase();
  const list = data.filter((o) => (status === "All" || o.status === status) && (method === "All" || o.paymentMethod === method) && (!s || o.id.toLowerCase().includes(s) || (o.orderCode ?? "").toLowerCase().includes(s)));
  const open = data.find((o) => o.id === id);
  const sel = "h-11 rounded-md border border-input bg-background px-3 text-sm";
  return (
    <>
      <PageHeader title="Orders" subtitle={`${data.length} orders`} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input aria-label="Search orders" placeholder="Order ID or cash code" className="h-11 pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select aria-label="Filter by status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Filter by payment" className={sel} value={method} onChange={(e) => setMethod(e.target.value)}><option value="All">All payments</option><option>Card</option><option>Cash</option></select>
        </div>
        {list.length === 0 ? <Empty message="No orders found." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2">Order ID</th><th>Date & time</th><th>Payment</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{list.map((o) => (
              <tr key={o.id} tabIndex={0} onClick={() => nav({ search: { id: o.id } })} onKeyDown={(e) => e.key === "Enter" && nav({ search: { id: o.id } })}
                className="h-12 cursor-pointer border-t hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
                <td className="font-medium">{o.id}{o.orderCode && <span className="ml-2 text-xs text-muted-foreground">{o.orderCode}</span>}</td><td>{fmtDate(o.createdAt)}</td><td>{o.paymentMethod}</td>
                <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td><td>{rs(o.total)}</td><td><StatusBadge s={o.status} /></td>
              </tr>))}</tbody></table></div>)}
      </Panel>
      <Sheet open={!!open} onOpenChange={(v) => !v && nav({ search: {} })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && <>
            <SheetHeader><SheetTitle>{open.id}</SheetTitle></SheetHeader>
            <div className="space-y-4 px-4 pb-6 text-sm">
              <p className="text-muted-foreground">{fmtDate(open.createdAt)} · {open.paymentMethod}{open.orderCode ? ` · Code ${open.orderCode}` : ""}</p>
              <ul className="divide-y rounded-xl border">{open.items.map((i) => (
                <li key={i.product.id} className="flex justify-between gap-2 p-3"><div><p className="font-medium">{i.product.name}</p><p className="text-xs text-muted-foreground">{i.quantity} × {rs(i.product.price)}</p></div><p>{rs(i.quantity * i.product.price)}</p></li>
              ))}</ul>
              <dl className="space-y-1">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{rs(open.subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Discount</dt><dd>− {rs(open.discount)}</dd></div>
                <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{rs(open.total)}</dd></div>
              </dl>
              <div className="space-y-1.5"><label htmlFor="ost" className="font-medium">Status</label>
                <select id="ost" className={`${sel} w-full`} value={open.status} onChange={(e) => { orderService.setStatus(open.id, e.target.value as Order["status"]); toast.success(`Order marked ${e.target.value}`); }}>
                  {STATUSES.map((x) => <option key={x} disabled={open.paymentMethod === "Card" && x === "Pending"}>{x}</option>)}
                </select>
                <StatusBadge s={open.status} />
              </div>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </>
  );
}
