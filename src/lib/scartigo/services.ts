// localStorage-backed services. Swap bodies for API calls later; signatures stay.
export const CATEGORIES = [
  "Beverages", "Snacks", "Dairy", "Bakery", "Grocery", "Fruits", "Personal Care", "Household", "Frozen",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string; name: string; brand: string; category: Category; description: string;
  ingredients: string[]; price: number; discountPercentage?: number; image: string;
  barcode: string; available: boolean; stock: number;
}
export interface OrderItem { product: Product; quantity: number }
export interface Order {
  id: string; items: OrderItem[]; subtotal: number; discount: number; total: number;
  paymentMethod: "Card" | "Cash"; paymentStatus: "Pending" | "Paid";
  status: "Pending" | "Paid" | "Completed"; orderCode?: string; createdAt: string;
}
export interface AppNotification { id: string; title: string; message: string; createdAt: string; read: boolean }

const K = { products: "scartigo_products", orders: "scartigo_orders", notes: "scartigo_notifications", seeded: "scartigo_orders_seeded", admin: "scartigo_admin_session" };
const EVT = "scartigo-change";

const read = <T,>(k: string, fb: T): T => {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event(EVT)); };
export const subscribe = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; };
const uid = () => Math.random().toString(36).slice(2, 10);

const P = (barcode: string, name: string, brand: string, category: Category, price: number, discountPercentage = 0, stock = 40): Product => ({
  id: barcode.toLowerCase(), barcode, name, brand, category, price, discountPercentage, stock, available: true, image: "",
  description: `${name} by ${brand}.`, ingredients: [],
});
const SEED_PRODUCTS: Product[] = [
  P("SC1001", "Mango Juice", "Nestlé", "Beverages", 180, 10),
  P("SC1002", "Mineral Water 1.5L", "Aquafina", "Beverages", 90),
  P("SC1003", "Potato Chips", "Lay's", "Snacks", 100, 0, 6),
  P("SC1004", "Chocolate Biscuits", "Peek Freans", "Snacks", 70),
  P("SC1005", "Fresh Milk 1L", "Olpers", "Dairy", 280),
  P("SC1006", "Plain Yogurt", "Nestlé", "Dairy", 220, 0, 8),
  P("SC1007", "Brown Bread", "Dawn", "Bakery", 200),
  P("SC1008", "Basmati Rice 5kg", "Guard", "Grocery", 1850, 5),
  P("SC1009", "Bananas (dozen)", "Local Farm", "Fruits", 240),
  P("SC1010", "Shampoo 400ml", "Sunsilk", "Personal Care", 650, 15),
  P("SC1011", "Dishwash Liquid", "Lemon Max", "Household", 350, 0, 4),
  P("SC1012", "Frozen Parathas", "K&N's", "Frozen", 480),
];

const totals = (items: OrderItem[]) => {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = Math.round(items.reduce((s, i) => s + i.product.price * i.quantity * ((i.product.discountPercentage ?? 0) / 100), 0));
  return { subtotal, discount, total: subtotal - discount };
};
const code = () => "SC-" + Math.floor(1000 + Math.random() * 9000);

export const productService = {
  getAll(): Product[] {
    const list = read<Product[] | null>(K.products, null);
    if (!list) { write(K.products, SEED_PRODUCTS); return SEED_PRODUCTS; }
    return list.map((p) => ({ ...p, stock: p.stock ?? 40, available: p.available ?? true }));
  },
  getByBarcode: (bc: string) => productService.getAll().find((p) => p.barcode.toLowerCase() === bc.toLowerCase()),
  isCodeTaken: (bc: string, exceptId?: string) => productService.getAll().some((p) => p.barcode.toLowerCase() === bc.trim().toLowerCase() && p.id !== exceptId),
  save(p: Omit<Product, "id"> & { id?: string | undefined }): Product {
    const list = productService.getAll();
    const prev = p.id ? list.find((x) => x.id === p.id) : undefined;
    const item: Product = { ...p, id: p.id ?? uid() } as Product;
    write(K.products, prev ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]);
    const d = item.discountPercentage ?? 0;
    if (d > 0 && d > (prev?.discountPercentage ?? 0)) notificationService.add(`${d}% OFF on ${item.name}`, `${item.name} is now ${d}% off in store.`);
    return item;
  },
  remove: (id: string) => write(K.products, productService.getAll().filter((p) => p.id !== id)),
  reduceStock(items: OrderItem[]) {
    write(K.products, productService.getAll().map((p) => {
      const it = items.find((i) => i.product.id === p.id);
      if (!it) return p;
      const stock = Math.max(0, p.stock - it.quantity);
      return { ...p, stock, available: stock === 0 ? false : p.available };
    }));
  },
};

export const orderService = {
  getAll(): Order[] {
    if (typeof window !== "undefined" && !localStorage.getItem(K.seeded)) {
      localStorage.setItem(K.seeded, "1");
      if (!read<Order[]>(K.orders, []).length) write(K.orders, seedOrders());
    }
    return read<Order[]>(K.orders, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  place(items: OrderItem[], paymentMethod: "Card" | "Cash"): Order {
    const paid = paymentMethod === "Card";
    const o: Order = { id: "ORD-" + Date.now().toString().slice(-6), items, ...totals(items), paymentMethod,
      paymentStatus: paid ? "Paid" : "Pending", status: paid ? "Paid" : "Pending",
      orderCode: paid ? undefined : code(), createdAt: new Date().toISOString() };
    write(K.orders, [o, ...orderService.getAll()]);
    productService.reduceStock(items);
    return o;
  },
  setStatus(id: string, status: Order["status"]) {
    write(K.orders, orderService.getAll().map((o) => {
      if (o.id !== id) return o;
      if (o.paymentMethod === "Card" && status === "Pending") return o;
      return { ...o, status, paymentStatus: status === "Pending" ? "Pending" : "Paid" };
    }));
  },
};

export const notificationService = {
  getAll: () => read<AppNotification[]>(K.notes, []),
  add: (title: string, message: string) => write(K.notes, [{ id: uid(), title, message, createdAt: new Date().toISOString(), read: false }, ...notificationService.getAll()]),
};

export const adminAuth = {
  login(email: string, password: string): string | null {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email";
    if (password !== "admin123") return "Incorrect admin credentials";
    localStorage.setItem(K.admin, JSON.stringify({ email, at: Date.now() }));
    return null;
  },
  isLoggedIn: () => typeof window !== "undefined" && !!localStorage.getItem(K.admin),
  logout: () => localStorage.removeItem(K.admin),
};

function seedOrders(): Order[] {
  const ps = productService.getAll();
  const statuses: Order["status"][] = ["Completed", "Paid", "Pending", "Completed", "Paid", "Completed"];
  return Array.from({ length: 12 }, (_, i) => {
    const items = [0, 1, 2].slice(0, 1 + (i % 3)).map((k) => ({ product: ps[(i * 3 + k * 5) % ps.length], quantity: 1 + ((i + k) % 3) }));
    const method: "Card" | "Cash" = i % 2 ? "Cash" : "Card";
    let status = statuses[i % statuses.length];
    if (method === "Card" && status === "Pending") status = "Paid";
    const d = new Date(); d.setDate(d.getDate() - (i % 7)); d.setHours(10 + (i % 9), (i * 13) % 60);
    return { id: `ORD-${(100201 + i)}`, items, ...totals(items), paymentMethod: method,
      paymentStatus: status === "Pending" ? "Pending" : "Paid", status,
      orderCode: method === "Cash" ? `SC-${4100 + i * 7}` : undefined, createdAt: d.toISOString() };
  });
}

export const rs = (n: number) => "Rs. " + Math.round(n || 0).toLocaleString("en-PK");
