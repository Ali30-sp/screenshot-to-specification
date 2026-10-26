import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Package, Coffee, Cookie, Milk, Croissant, Wheat, Apple, Sparkles, Home, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, Order, Product } from "@/lib/scartigo/services";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) =>
  <section className={`rounded-xl border bg-card p-4 shadow-sm ${className}`}>{children}</section>;

export function Loading() {
  return <div className="space-y-3" aria-busy="true" aria-label="Loading">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <Panel className="flex flex-col items-center gap-3 py-10 text-center"><AlertTriangle className="size-8 text-destructive" /><p>We couldn't load this right now.</p><Button className="h-11" onClick={onRetry}>Retry</Button></Panel>;
}
export function Empty({ message }: { message: string }) {
  return <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"><Inbox className="size-8" /><p className="text-sm">{message}</p></div>;
}

const tone = {
  green: "bg-success/15 text-success border-success/30",
  red: "bg-destructive/10 text-destructive border-destructive/30",
  orange: "bg-warning-soft text-foreground border-primary/40",
  blue: "bg-secondary text-foreground border-border",
};
export const Badge = ({ t, children }: { t: keyof typeof tone; children: ReactNode }) =>
  <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone[t]}`}>{children}</span>;

export const StatusBadge = ({ s }: { s: Order["status"] }) =>
  <Badge t={s === "Completed" ? "green" : s === "Paid" ? "blue" : "orange"}>{s}</Badge>;

const icons: Record<Category, typeof Package> = { Beverages: Coffee, Snacks: Cookie, Dairy: Milk, Bakery: Croissant, Grocery: Wheat, Fruits: Apple, "Personal Care": Sparkles, Household: Home, Frozen: Snowflake };
export function ProductThumb({ p }: { p: Product }) {
  const Icon = icons[p.category] ?? Package;
  return p.image
    ? <img src={p.image} alt="" className="size-10 rounded-lg object-cover" />
    : <div className="flex size-10 items-center justify-center rounded-lg bg-secondary" aria-hidden><Icon className="size-5" /></div>;
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
