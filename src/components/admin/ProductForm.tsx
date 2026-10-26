import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, productService, type Category, type Product } from "@/lib/scartigo/services";

const blank = { name: "", brand: "", category: "Beverages" as Category, price: "", discount: "0", stock: "", barcode: "", description: "", ingredients: "", available: true };

export function ProductForm({ open, product, onClose }: { open: boolean; product: Product | null; onClose: () => void }) {
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!open) return;
    setErrs({});
    setF(product ? { name: product.name, brand: product.brand, category: product.category, price: String(product.price), discount: String(product.discountPercentage ?? 0), stock: String(product.stock), barcode: product.barcode, description: product.description, ingredients: product.ingredients.join(", "), available: product.available } : blank);
  }, [open, product]);
  const set = (k: keyof typeof blank, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!f.brand.trim()) e.brand = "Brand is required";
    const price = Number(f.price), stock = Number(f.stock), disc = Number(f.discount);
    if (!(price > 0)) e.price = "Price must be a positive number";
    if (f.stock === "" || !Number.isInteger(stock) || stock < 0) e.stock = "Stock must be a positive whole number";
    if (!(disc >= 0 && disc <= 90)) e.discount = "Discount must be between 0 and 90";
    if (!f.barcode.trim()) e.barcode = "Product code is required";
    else if (productService.isCodeTaken(f.barcode, product?.id)) e.barcode = `Product code ${f.barcode.toUpperCase()} is already used by another product`;
    setErrs(e);
    if (Object.keys(e).length) return;
    productService.save({
      id: product?.id, name: f.name.trim(), brand: f.brand.trim(), category: f.category, price, discountPercentage: disc, stock,
      barcode: f.barcode.trim().toUpperCase(), description: f.description.trim(), image: product?.image ?? "",
      ingredients: f.ingredients.split(",").map((s) => s.trim()).filter(Boolean), available: stock === 0 ? false : f.available,
    });
    toast.success(product ? "Product updated" : "Product added");
    onClose();
  };

  const field = (k: keyof typeof blank, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} className="h-11" value={f[k] as string} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errs[k]} />
      {errs[k] && <p className="text-xs text-destructive">{errs[k]}</p>}
    </div>
  );
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{product ? `Edit ${product.name}` : "Add product"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("name", "Name")}{field("brand", "Brand")}
          <div className="space-y-1.5"><Label htmlFor="category">Category</Label>
            <select id="category" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          {field("barcode", "Product code")}{field("price", "Price (Rs.)", "number")}{field("discount", "Discount %", "number")}{field("stock", "Stock", "number")}
          <div className="flex items-center gap-3 pt-6"><Switch id="available" checked={f.available} onCheckedChange={(v) => set("available", v)} /><Label htmlFor="available">Available</Label></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="sm:col-span-2">{field("ingredients", "Ingredients (comma separated)")}</div>
        </div>
        <DialogFooter><Button variant="outline" className="h-11" onClick={onClose}>Cancel</Button><Button className="h-11" onClick={submit}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
