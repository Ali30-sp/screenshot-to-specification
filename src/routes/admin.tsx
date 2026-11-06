import { createFileRoute, Link, Outlet, redirect, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, LayoutDashboard, LogOut, Menu, Package, Receipt, ShoppingCart, X, Users, Target, ListTodo, UserPlus, FolderKanban, Truck, Car, FileText, ShieldCheck, Settings } from "lucide-react";
import { adminAuth } from "@/lib/scartigo/services";
import { Button } from "@/components/ui/button";
import { HRProvider } from "@/lib/hr/context";
import { Header } from "@/components/hr/Header";
import { Assistant } from "@/components/hr/Assistant";

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

const hrItems = [
  ['employees','Employees',Users],['performance','Goals & Performance',Target],['tasks','Tasks & Reviews',ListTodo],['recruitment','Recruitment',UserPlus],['projects','Projects',FolderKanban],['procurement','Procurement',Truck],['assets','Assets & Fleet',Car],['policies','Policies',FileText],['security','Security & Admin',ShieldCheck],['settings','Settings',Settings],
] as const;
function AdminLayout() {
  const [open,setOpen]=useState(false);const nav=useNavigate();const loc=useLocation();
  return <HRProvider><div className="min-h-screen bg-background p-3 pb-28 md:p-6 md:pb-12">
    <aside className={`fixed bottom-3 left-3 right-3 z-40 flex rounded-[28px] bg-sidebar p-3 text-sidebar-foreground shadow-xl md:bottom-auto md:left-6 md:right-auto md:top-6 md:max-h-[calc(100vh-48px)] md:flex-col md:overflow-y-auto ${open?'md:w-56':'md:w-20'}`}>
      <Button variant="ghost" className="hero-banner mb-4 hidden size-12 shrink-0 rounded-2xl text-xl font-extrabold text-hero-foreground md:flex" aria-label={open?'Collapse navigation':'Expand navigation'} title="Expand navigation" onClick={()=>setOpen(!open)}>S<span className="text-cyan">.</span></Button>
      <nav aria-label="Workspace navigation" className="flex flex-1 gap-2 overflow-x-auto py-2 [scrollbar-width:none] md:flex-col md:overflow-visible md:gap-2">
        <Button asChild variant="ghost" className={`h-10 shrink-0 rounded-full ${open?'justify-start px-4':'w-10 self-center p-0'} ${loc.pathname==='/admin'||loc.pathname==='/admin/'?'rail-active':'hover:bg-sidebar-accent hover:text-hero-foreground'}`}><Link to="/admin" title="Dashboard" aria-label="Dashboard"><LayoutDashboard/>{open&&<span className="hidden md:inline">Dashboard</span>}</Link></Button>
        {hrItems.map(([section,label,Icon])=><Button asChild variant="ghost" key={section} className={`h-10 shrink-0 rounded-full ${open?'justify-start px-4':'w-10 self-center p-0'} ${loc.pathname.endsWith('/'+section)?'rail-active':'hover:bg-sidebar-accent hover:text-hero-foreground'}`}><Link to="/admin/hr/$section" params={{section}} search={{q:''}} title={label} aria-label={label}><Icon/>{open&&<span className="hidden md:inline text-xs">{label}</span>}</Link></Button>)}
        <span className="hidden border-t border-sidebar-border md:block"/>
        {items.slice(1).map(i=><Button asChild variant="ghost" key={i.to} className={`h-10 shrink-0 rounded-full ${open?'justify-start px-4':'w-10 self-center p-0'} ${loc.pathname===i.to?'rail-active':'hover:bg-sidebar-accent hover:text-hero-foreground'}`}><Link to={i.to} title={`Store ${i.label}`} aria-label={`Store ${i.label}`}><i.icon/>{open&&<span className="hidden md:inline text-xs">Store {i.label}</span>}</Link></Button>)}
        <Button variant="ghost" size="icon" className="h-10 shrink-0 self-center rounded-full hover:bg-sidebar-accent hover:text-hero-foreground" aria-label="Logout" title="Logout" onClick={()=>{adminAuth.logout();nav({to:'/'});}}><LogOut/></Button>
      </nav>
    </aside>
    <main className={`min-w-0 transition-all duration-200 ${open?'md:ml-64':'md:ml-28'}`}><Header/><Outlet/></main><Assistant/>
  </div></HRProvider>;
}
