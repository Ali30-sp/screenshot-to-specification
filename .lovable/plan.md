# Scartigo smart mart dashboard

## What will change
Redesign the existing dashboard around your grocery store brief, replacing the primary HR presentation with Scartigo store operations. Keep existing pages, sign-in, saved products, orders, and working store actions intact. Older HR pages remain accessible at their existing addresses but are removed from the main store navigation; no new HR features are added.

### 1. Look and navigation
- Apply Inter, dark green, orange buttons with dark green text, teal AI accents, white 24px bento cards, dark mode, and mobile bottom navigation.
- Add the store-owner greeting, Dashboard title, notification count, settings controls, and Add Product action.
- Show all requested grocery sections in the rail.
- Add Admin/Cashier demo selection and clearly displayed demo accounts on sign-in. Cashier presentation exposes only Orders and Cash Verification; this remains a frontend demo, not secure multi-user access.

### 2. Realistic demo data without overwriting your store
- Provide 60 grocery demo products across 8 categories, 300 orders, 120 customers, and 12 months of sales in separate demo state.
- Never reset or overwrite existing store records. Keep original store actions attached to their existing records; extended demo records live separately and are identified as demo data.
- Save new demo edits, settings, offers, notification history, and AI management choices in separate browser storage.

### 3. Dashboard
- Eight clickable statistics and Overview, Sales, Orders, Inventory, and AI Insights tabs.
- Sales trend with 7/30/90-day choices, payment split, best sellers, category performance, shopping-hour heatmap, purchase funnel, recent orders, and attention items.
- Working View, Export, and Hide menus, chart legends/tooltips, loading and empty states, and a data-driven mock daily summary.

### 4. Store tools
- **Products:** searchable/filterable/sortable/paginated table, selection and bulk actions, validated add/edit forms, image preview, description assistant, and sales-history details.
- **QR Codes:** real QR rendering, unique product labels, scan counts, regeneration, PNG downloads, bulk generation, and printable A4 labels.
- **Inventory:** reorder thresholds, restocking, movement history, stock alerts, and expiry tracking.
- **Discounts & Offers:** percentage, flat amount, buy-X-get-Y, and bundle offers with targets, schedules, status, usage, impact, and customer-cart preview.
- **Orders:** payment/date/status filters, details and timeline, completion/cancellation/mock refunds, digital receipts, and PDF/CSV downloads.
- **Cash Verification:** enter or simulate scanning an order code, inspect cart, confirm or reject, produce a receipt, and update the pending queue.

### 5. Store administration
- Customer profiles with purchases, spend, segments, receipts, and mock taste summaries.
- Payment transactions, failure reasons, settlements, and exports.
- Mock push notification composition, scheduling, templates, delivery history, and notifications triggered when offers become active.
- Report builder with date ranges, charts, tables, CSV/PDF export, and saved mock schedules.
- Store details, tax, receipt settings, payment toggles, demo permissions, QR and notification preferences, and audit history.

### 6. Mock Scart AI
- Floating data-driven assistant with typing state, suggested questions, and links to relevant pages.
- Insights, recommendation pin/boost/disable controls and cart preview, FAQ editing and unresolved questions, and a test chatbot.
- Seven-day category forecasts, restock suggestions, prefilled discount suggestions, and anomaly flags.
- Ctrl/Cmd+K command search for products, pending cash orders, and low-stock categories.
- Clearly label simulated AI and mock sending, payments, refunds, and report scheduling; no external AI or backend is added.

## Technical approach
- Retain TanStack routes, React, TypeScript, Tailwind, shadcn/ui, Recharts, and lucide.
- Keep existing Scartigo services unchanged. Add a separate grocery demo provider and focused feature components; reuse existing store screens where their behavior already meets the brief.
- Preserve existing store URLs. Add route files for new grocery destinations and app-specific page titles/descriptions.
- Use established client-side QR and PDF libraries rather than simulated codes or downloads.
- Keep semantic colors in the global design system. Validate browser-only storage after hydration.

## Verification
- Add tests for demo record counts, role restrictions, offer calculations, cash verification, inventory movements, and preservation of existing storage.
- Run existing routing/store tests and new focused tests.
- Exercise sign-in, product editing, QR download, cash verification and receipt creation, offer creation, and report export in the running dashboard.
- Check desktop and mobile for readable tables, navigation, chart rendering, and overlapping content.

## Limits
This is a browser-local demo. It does not provide secure cashier accounts, real payment processing, push delivery, cloud sharing, scheduled background jobs, or real AI calls.