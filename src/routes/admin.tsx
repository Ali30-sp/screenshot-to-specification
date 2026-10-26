import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, LayoutDashboard, LogOut, Menu, Package, Receipt, ShoppingCart, X } from "lucide-react";
import { adminAuth } from "@/lib/scartigo/services";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => { if (!adminAuth.isLoggedIn()) throw redirect({ to: "/" }); },
  head: () => ({ meta: [{ title: "Scartigo Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
] as const;

function Nav({ onNav }: { onNav?: () => void }) {
  const nav = useNavigate();
  return (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Admin">
      {items.map((i) => (
        <Link key={i.to} to={i.to} onClick={onNav} activeOptions={{ exact: "exact" in i }}
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring"
          activeProps={{ className: "!bg-sidebar-primary !text-sidebar-primary-foreground" }}>
          <i.icon className="size-5" />{i.label}
        </Link>
      ))}
      <button onClick={() => { adminAuth.logout(); nav({ to: "/" }); }}
        className="mt-auto flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
        <LogOut className="size-5" />Logout
      </button>
    </nav>
  );
}

const Logo = () => (
  <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><ShoppingCart className="size-5" /></div>
    <div className="leading-tight text-sidebar-foreground"><p className="font-bold">Scartigo</p><p className="text-xs opacity-80">Admin</p></div></div>
);

function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar md:sticky md:top-0 md:flex md:h-screen">
        <div className="p-5"><Logo /></div><Nav />
      </aside>
      <header className="sticky top-0 z-30 bg-sidebar md:hidden">
        <div className="flex items-center justify-between p-3"><Logo />
          <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="flex size-11 items-center justify-center rounded-lg text-sidebar-foreground">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="h-[320px]"><Nav onNav={() => setOpen(false)} /></div>}
      </header>
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
