import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge, Empty, ErrorState, Loading, PageHeader, Panel, ProductThumb } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { CATEGORIES, productService, rs, type Product } from "@/lib/scartigo/services";
import { useStore } from "@/lib/scartigo/use-store";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const { data, loading, error, retry } = useStore(productService.getAll);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [form, setForm] = useState<{ open: boolean; p: Product | null }>({ open: false, p: null });
  const [del, setDel] = useState<Product | null>(null);
  const add = <Button className="h-11" onClick={() => setForm({ open: true, p: null })}><Plus className="size-4" />Add Product</Button>;
  if (loading) return <><PageHeader title="Products" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Products" /><ErrorState onRetry={retry} /></>;
  const s = q.trim().toLowerCase();
  const list = data.filter((p) => (cat === "All" || p.category === cat) && (!s || [p.name, p.brand, p.barcode].some((v) => v.toLowerCase().includes(s))));
  return (
    <>
      <PageHeader title="Products" subtitle={`${data.length} products in store`} action={add} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input aria-label="Search products" placeholder="Search name, brand or code" className="h-11 pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select aria-label="Filter by category" className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {list.length === 0 ? <Empty message="No products match your search." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-2"></th><th>Name</th><th>Brand</th><th>Category</th><th>Code</th><th>Price</th><th>Disc.</th><th>Stock</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2"><ProductThumb p={p} /></td><td className="font-medium">{p.name}</td><td>{p.brand}</td><td>{p.category}</td><td className="font-mono text-xs">{p.barcode}</td><td>{rs(p.price)}</td>
                <td>{p.discountPercentage ? <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-semibold">{p.discountPercentage}%</span> : "—"}</td>
                <td><Badge t={p.stock < 10 ? "red" : "green"}>{p.stock}</Badge></td>
                <td><Badge t={p.available ? "green" : "red"}>{p.available ? "Available" : "Out of stock"}</Badge></td>
                <td className="text-right"><Button variant="ghost" size="icon" className="size-11" aria-label={`Edit ${p.name}`} onClick={() => setForm({ open: true, p })}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-11 text-destructive" aria-label={`Delete ${p.name}`} onClick={() => setDel(p)}><Trash2 className="size-4" /></Button></td>
              </tr>))}</tbody></table></div>)}
      </Panel>
      <ProductForm open={form.open} product={form.p} onClose={() => setForm({ open: false, p: null })} />
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {del?.name}?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (del) { productService.remove(del.id); toast.success(`${del.name} deleted`); } setDel(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
