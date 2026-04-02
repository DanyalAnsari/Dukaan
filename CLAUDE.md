# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Dukaan** — a full-stack billing and inventory management web app for small
Indian shopkeepers (kirana stores, retail shops). Built for simplicity: the
target user is a 40-year-old shopkeeper who is not tech-savvy.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Drizzle ORM (`drizzle-orm@^0.45.x`)
- **Auth**: Better Auth (`better-auth@^1.5.x`)
- **State**: Zustand (client-side cart and shop state only)
- **UI**: shadcn/ui (New York style) + Tailwind CSS v4
- **PDF**: pdfmake (invoice generation in Route Handlers)
- **Package manager**: pnpm

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # TypeScript check

# Database
pnpm drizzle-kit generate   # Generate migration from schema changes
pnpm drizzle-kit migrate    # Apply migrations to DB
pnpm drizzle-kit studio     # Open Drizzle Studio (DB browser)

# Auth
npx auth generate --adapter drizzle   # Generate Better Auth schema
npx auth migrate                      # Run auth migrations
```

````

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx
    (dashboard)/
      layout.tsx              ← auth check + sidebar shell
      dashboard/page.tsx
      bills/
        page.tsx              ← bill history list
        new/page.tsx          ← NEW BILL (most important screen)
        [id]/page.tsx         ← invoice view + share/print
      products/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
      customers/
        page.tsx
        new/page.tsx
        [id]/page.tsx         ← customer ledger (udhar)
      settings/page.tsx
    api/
      auth/[...all]/route.ts
      bills/route.ts                  ← POST: atomic bill creation
      bills/[id]/pdf/route.ts         ← GET: pdfmake invoice PDF
      payments/route.ts
      products/route.ts
      products/[id]/route.ts
      customers/route.ts
      dashboard/summary/route.ts
    layout.tsx
    globals.css
    proxy.ts                  ← Next.js 16 (replaces middleware.ts)
  db/
    index.ts                  ← Drizzle client
    schema.ts                 ← All table definitions
  lib/
    auth.ts                   ← Better Auth server config
    auth-client.ts            ← Better Auth browser client
    utils.ts                  ← formatCurrency, amountInWords, cn()
  stores/
    useCartStore.ts           ← Bill creation cart state
    useShopStore.ts           ← Current shop details
  components/
    ui/                       ← shadcn/ui components (do not edit)
    layout/                   ← Sidebar, TopBar, AppShell
    bills/                    ← BillTable, InvoiceView, CartPanel
    products/                 ← ProductTable, ProductForm
    customers/                ← CustomerTable, LedgerView
```

## Next.js 16 Critical Rules

**Always `await` params and searchParams — they are Promises in Next.js 16:**

```tsx
// CORRECT
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
}

// WRONG — will throw in Next.js 16
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params  // ❌
}
```

- Route Handlers are **uncached by default** — no need for `cache: 'no-store'`
- Use `proxy.ts` not `middleware.ts` (Next.js 16 renamed it)
- Use `next.config.ts` (TypeScript), not `next.config.js`
- Turbopack is default — do not add webpack config unless strictly necessary
- Server Components fetch data directly; `'use client'` only for interactivity

## Database Schema

All tables defined in `src/db/schema.ts`. Key rules:

- **All monetary values stored in paise (integer)** — never store rupees
- IDs are UUIDs (`uuid().primaryKey().defaultRandom()`)
- Timestamps use `timestamp().defaultNow().notNull()`
- Never hard-delete products — use `isActive: boolean` soft delete
- `billItems` snapshots `productName` and `unitPrice` at time of sale
  so old invoices remain correct if product is later edited/deleted

Tables: `shops`, `products`, `customers`, `bills`, `billItems`,
`payments`, `purchases`

Relations use stable Drizzle API (`relations` from `drizzle-orm`).
**Do NOT use the v1 beta `defineRelations` API** — it is unstable.

## Auth (Better Auth)

Server config in `src/lib/auth.ts`:

```ts
import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
```

Route handler at `app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
export const { GET, POST } = toNextJsHandler(auth)
```

Session cookie name: `better-auth.session_token`

## Business Logic Rules

### Currency

- **Always store in paise** (multiply rupees × 100 before storing)
- **Always display in rupees** using `formatCurrency(paise)` from `lib/utils.ts`
- Use `Math.round()` for all paise calculations — never `Math.floor()`
- Display format: `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })`

```ts
// lib/utils.ts
export function formatCurrency(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  })
}
```

### GST Calculation

```ts
// All values in paise
const subtotal = unitPrice * quantity
const gstAmount = Math.round((subtotal * gstRate) / 100)
const lineTotal = subtotal + gstAmount

// On invoices: split GST as CGST + SGST (50% each)
const cgst = totalGst / 2
const sgst = totalGst / 2
```

Valid GST rates: `0 | 5 | 12 | 18 | 28` — no other values allowed.

### Invoice Number Generation

- Format: `INV-0001`, `INV-0042` (4-digit zero-padded)
- Scoped per shop (each shop starts from INV-0001)
- Must be generated atomically inside a DB transaction to avoid duplicates

### Bill Creation (POST /api/bills)

Must be a single DB transaction:

1. Validate all products exist and have sufficient stock
2. Insert `bills` record with generated invoice number
3. Insert all `billItems` (with name/price snapshots)
4. Decrement `stockQty` for each product
5. Update `customer.outstandingBalance` if status is `credit` or `partial`
6. If any step fails → rollback everything

```ts
await db.transaction(async (tx) => {
  // all steps inside here
})
```

### Customer Balance

- `outstandingBalance` is denormalized on the `customers` table
- Positive value = customer owes the shop (udhar)
- Always update atomically with related bill or payment creation

## Design System

### Colors (CSS variables in `globals.css`)

```
Light mode:
  --background:   #fafaf7   warm off-white (NOT pure white)
  --foreground:   #1c1917   warm near-black (NOT cold #000)
  --primary:      #166534   deep forest green (NOT bright SaaS green)
  --border:       #e5e5e0

Dark mode:
  --background:   #0f1410   green-tinted dark (NOT gray)
  --primary:      oklch(0.520 0.130 151)  lighter green for dark bg
```

### Typography

- **UI font**: DM Sans (400, 500) — loaded via `next/font/google`
- **Display font**: Instrument Serif — invoices, large amounts, wordmark ONLY
- **Monospace**: DM Mono — ALL rupee amounts, invoice numbers, phone numbers,
  SKUs, GST numbers, barcodes
- `font-mono` class must be on every currency display, never plain text

### Component Rules

- Border radius: `rounded` (6px) maximum. **No `rounded-full` on buttons.**
- Shadows: `shadow-sm` only. No colored shadows.
- **No gradients anywhere** — flat fills only
- No decorative illustrations or mascots
- Table row height: 48px desktop, 40px on `/bills/new`
- Status badges always use semantic bg/text/border color triples (see below)

### Status Badge Pattern

```tsx
// paid
<Badge className="bg-green-50 text-green-700 border border-green-200">
  Paid
</Badge>
// partial
<Badge className="bg-amber-50 text-amber-700 border border-amber-200">
  Partial
</Badge>
// unpaid
<Badge className="bg-red-50 text-red-700 border border-red-200">
  Unpaid
</Badge>
```

### shadcn/ui Components to Use

```
Button, Input, Textarea, Label, Form (react-hook-form)
Table, TableHeader, TableBody, TableRow, TableHead, TableCell
Card, CardHeader, CardContent, CardFooter
Badge, Separator, Skeleton
Dialog, Sheet, DropdownMenu, Select, Combobox
Switch, Sonner (toast notifications)
```

Add components with: `npx shadcn@latest add <component>`

## Zustand Stores

### useCartStore (`src/stores/useCartStore.ts`)

Manages the in-progress bill on `/bills/new`. Key shape:

```ts
interface CartItem {
  productId: string
  productName: string
  unitPrice: number    // paise
  quantity: number
  gstRate: number
  gstAmount: number    // paise, computed
  lineTotal: number    // paise, computed
}
interface CartStore {
  items: CartItem[]
  customerId: string | null
  customerName: string | null
  paymentMode: 'cash' | 'upi' | 'card' | 'credit'
  amountPaid: number   // paise
  addItem: (product) => void
  updateQty: (productId, qty) => void
  removeItem: (productId) => void
  clearCart: () => void
  // derived
  subtotal: () => number
  totalGst: () => number
  totalAmount: () => number
}
```

### useShopStore (`src/stores/useShopStore.ts`)

Holds current shop config (name, GSTIN, logo). Loaded once on app init.

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Patterns

### Server Component data fetch

```tsx
// app/(dashboard)/products/page.tsx
import { db } from "@/db"
import { products } from "@/db/schema"

export default async function ProductsPage() {
  const data = await db.select().from(products).where(...)
  return <ProductTable products={data} />
}
```

### Client Component with form

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
```

### Route Handler (API)

```ts
// app/api/bills/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

### WhatsApp share

```ts
// Share invoice PDF via native share sheet (Android) or fallback
const blob = await fetch(`/api/bills/${id}/pdf`).then(r => r.blob())
const file = new File([blob], `INV-${number}.pdf`, { type: 'application/pdf' })
if (navigator.canShare?.({ files: [file] })) {
  await navigator.share({ files: [file], title: 'Invoice' })
} else {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
}
```

## What NOT to Do

- ❌ Store rupees in DB — always paise
- ❌ Use `Math.floor()` for money — always `Math.round()`
- ❌ Use synchronous `params` in pages — always `await params`
- ❌ Use `middleware.ts` — use `proxy.ts` in Next.js 16
- ❌ Use Drizzle v1 beta `defineRelations` — use stable `relations`
- ❌ Use `better-auth` full import with drizzle — use `better-auth/minimal`
- ❌ Hard delete products — set `isActive = false`
- ❌ Create bills outside a DB transaction
- ❌ Display currency without `formatCurrency()` helper
- ❌ Use `rounded-full` on buttons
- ❌ Use gradients anywhere in the UI
- ❌ Use `font-sans` for rupee amounts — always `font-mono`

```

```
