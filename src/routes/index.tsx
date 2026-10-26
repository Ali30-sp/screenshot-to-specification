import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminAuth } from "@/lib/scartigo/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scartigo Admin — Sign in" },
      { name: "description", content: "Store manager sign-in for the Scartigo Smart Mart admin dashboard." },
      { property: "og:title", content: "Scartigo Admin — Sign in" },
      { property: "og:description", content: "Manage products, orders and reports for your Smart Mart." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        className="w-full max-w-sm space-y-5 rounded-xl border bg-card p-6 shadow-sm"
        onSubmit={(e) => { e.preventDefault(); const err = adminAuth.login(email, password); if (err) setError(err); else nav({ to: "/admin" }); }}
      >
        <div className="flex items-center gap-2"><div className="flex size-10 items-center justify-center rounded-xl bg-primary"><ShoppingCart className="size-5" /></div><div><p className="text-xl font-bold">Scartigo</p><p className="text-xs text-muted-foreground">Admin sign in</p></div></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-11 w-full font-semibold">Sign in</Button>
      </form>
    </main>
  );
}
