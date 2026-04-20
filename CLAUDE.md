# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.
Read FEATURES.md for detailed per-feature and per-page specifications.

## Project Overview

**Dukaan** — a full-stack billing and inventory management web app for small
Indian shopkeepers (kirana stores, retail shops). Built for simplicity: the
target user is a 40-year-old shopkeeper who is not tech-savvy.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Drizzle ORM (`drizzle-orm@^0.45.x`)
- **Auth**: Better Auth (`better-auth@^1.5.x`) — email/password only, NO org plugin
- **State**: Zustand (client-side cart and shop state only)
- **UI**: shadcn/ui (New York style) + Tailwind CSS v4
- **Tables**: TanStack Table (`@tanstack/react-table`) — all data tables
- **Forms**: react-hook-form + zod (client validation), API routes (mutations)
- **PDF**: pdfmake (invoice generation in Route Handlers)
- **Package manager**: pnpm

## Guidelines

- Always use shadcn skills from `./.agents/skills/shadcn/SKILL.md`

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # TypeScript check

# Database
pnpm db:generate    # Generate migration from schema changes (drizzle-kit generate)
pnpm db:migrate     # Apply migrations to DB (drizzle-kit migrate)
pnpm db:push        # Push schema directly to DB (drizzle-kit push)
pnpm db:seed        # Seed database (tsx database/seed/index.ts)

# Auth schema generation (run after configuring auth.ts)
npx auth generate --adapter drizzle
npx auth migrate
```

## Project Structure

```
app/
  (auth)/
    _components/
      login-form.tsx          ← client form, uses authClient.signIn.email()
      signup-form.tsx          ← client form, uses authClient.signUp.email()
    layout.tsx                 ← split layout: brand panel + form
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    _components/
      dashboard-sidebar.tsx    ← shadcn SidebarProvider
    layout.tsx                 ← auth check + shop check + sidebar shell
    dashboard/
      _components/
      page.tsx
    bills/
      page.tsx
      new/page.tsx             ← NEW BILL (most important screen)
      [id]/page.tsx
    products/
      _components/
        column.tsx             ← TanStack column definitions
        data-table.tsx         ← generic TanStack Table component
      page.tsx
      new/page.tsx
    customers/
      page.tsx
      [id]/page.tsx
    settings/
      page.tsx
  setup/
    _components/
    _lib/
    layout.tsx
    page.tsx
  api/
    auth/[...all]/route.ts     ← Better Auth handler
    auth/me/...                ← session endpoint
    bills/route.ts             ← GET (list) + POST (create bill)
    bills/[id]/route.ts        ← GET (single bill)
    bills/[id]/pdf/...         ← pdfmake PDF Route Handler
    customers/route.ts         ← GET (list) + POST (create)
    products/route.ts          ← GET (list) + POST (create)
    products/[id]/route.ts     ← GET/PUT/DELETE
    dashboard/summary/route.ts ← dashboard stats
    setup/route.ts             ← POST (one-time shop creation)
    shops/me/...               ← current shop
  layout.tsx
  globals.css
  page.tsx                     ← landing page
database/
  index.ts                     ← drizzle client + schema export
  schemas/
    auth.ts                    ← user, session, account, verification
    business.ts                ← shops, products, customers, bills, billItems, payments, purchases
    relations.ts               ← drizzle relations
    index.ts                   ← re-exports all
  data/
    shop.ts                    ← getShopByUserId()
    bills.ts                   ← getTodaysBills()
    products.ts                ← getLowStockProducts()
  migrations/
  seed/
lib/
  auth.ts                      ← Better Auth server config
  auth-client.ts               ← Better Auth browser client (better-auth/react)
  get-session.ts               ← getSession() helper (cached, "use server")
  utils.ts                     ← formatCurrency, amountInWords, formatDate, cn()
stores/
  useCartStore.ts              ← bill creation cart state
  useShopStore.ts              ← current shop context
components/
  ui/                          ← shadcn/ui (do not edit manually)
  shared/
    stats-card.tsx             ← reusable stat card
    table/                     ← shared table components
    theme-toggle.tsx           ← dark/light mode toggle
  session-provider.tsx         ← session context provider
  theme-provider.tsx           ← next-themes provider
constants/
  index.ts                     ← LOGO, GST_RATES
types/
  index.ts                     ← Product, Shop interfaces
  pdfmake.d.ts                 ← pdfmake type declarations
hooks/
  use-mobile.ts                ← mobile breakpoint hook
proxy.ts                       ← Next.js 16 route protection (root level)
drizzle.config.ts              ← drizzle-kit config
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

- Route Handlers are **uncached by default**
- Use `proxy.ts` not `middleware.ts`
- Turbopack is default — no webpack config
- Server Components fetch data; `'use client'` only for interactivity

## Auth Setup (Better Auth)

**Decision: No Organization plugin in MVP.**
One user = one shop. The `shops` table links to the user via `ownerId`.
The org plugin adds 4 unused tables. V3 migration: shops → organizations.

```ts
// lib/auth.ts
import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db, schema } from "@/database"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  plugins: [nextCookies()],
})
```

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export const { useSession, signIn, signOut, signUp } = authClient
```

**Auth route handler:**

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
export const { GET, POST } = toNextJsHandler(auth)
```

**Session helper (use this in server components and API routes):**

```ts
// lib/get-session.ts
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(
  async () =>
    await auth.api.getSession({
      headers: await headers(),
    })
);
```

**Shop resolution — `getShopByUserId` (Recommended):**

The recommended architecture is to fetch the shop based on the authenticated user ID.
Both `getSession()` and `getShopByUserId()` are wrapped in React `cache()`,
making this pattern efficient and consistent across Server Components and Actions.

```ts
const session = await getSession();
if (!session) redirect("/login");

const shop = await getShopByUserId(session.user.id);
if (!shop) redirect("/setup");

const shopId = shop.id;
```

This avoids the complexity of custom Session data in Better Auth while
maintaining high performance via server-side caching.

## Mutation Strategy — Server Actions (ALL mutations)

Server Actions for **every mutation** (create, update, delete, toggle).
API Routes ONLY for:
- `api/auth/[...all]` — Better Auth handler (required)
- `api/bills/[id]/pdf` — PDF binary stream response

### Form-based action (create / update)

```ts
// products/new/actions.ts
"use server"
import { getSession } from "@/lib/get-session"
import { getShopByUserId } from "@/database/data/shop"
import { db } from "@/database"
import { products } from "@/database/schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const schema = z.object({ name: z.string().min(1), /* ... */ })
type ActionState = { error?: Record<string, string[]> } | null

export async function createProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session) redirect("/login")
  const shop = await getShopByUserId(session.user.id)
  if (!shop) redirect("/setup")

  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  await db.insert(products).values({ ...parsed.data, shopId: shop.id })

  revalidatePath("/products")
  redirect("/products")
}
```

### Non-form action (delete, toggle)

```ts
// products/actions.ts
"use server"
export async function deleteProduct(productId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  const shop = await getShopByUserId(session.user.id)

  await db.update(products)
    .set({ isActive: false })
    .where(and(eq(products.id, productId), eq(products.shopId, shop.id)))

  revalidatePath("/products")
}
```

Usage from client:
```tsx
"use client"
import { deleteProduct } from "./actions"

function DeleteButton({ productId }: { productId: string }) {
  return (
    <Button onClick={async () => {
      if (confirm("Delete?")) await deleteProduct(productId)
    }}>
      Delete
    </Button>
  )
}
```

### Complex JSON action (bill creation)

Bill creation is called from client `onClick` (not form submit) because
cart data is complex JSON. This is still a Server Action — no API route needed.

```ts
// bills/new/actions.ts
"use server"
import type { CartItem } from "@/stores/useCartStore"

export async function createBill(data: {
  items: CartItem[]
  customerId: string | null
  paymentMethod: string
}) {
  // auth check, transaction, revalidate, redirect
}
```

## Tables — Two Patterns

### TanStack Table (data-heavy, interactive)

Use for pages with sorting, filtering, search, and pagination.
`'use client'` components receiving data as server-fetched props.

Reference implementation: `app/(dashboard)/products/_components/data-table.tsx`

**Use for:** Products list, Bills list, Customers list, Customer ledger bill history.

Column definitions always define explicit `cell` renderers for:

- Currency columns: wrap in `<span className="font-mono">`
- Status columns: use status Badge components
- Date columns: use `formatDate(value)` from `lib/utils.ts`
- Action columns: use icon buttons, not text links

### Normal shadcn Table (overview / read-only)

Use for simple data display, no client-side interaction.
Can live inside server components directly.

**Use for:** Dashboard today's bills, Unpaid customers card, Invoice line items,
Cart items on `/bills/new`.

## Database Schema

All tables in `database/schemas/`. Key rules:

- **All monetary values stored in paise (integer)** — never rupees
- Column naming: `unitPricePaise`, `mrpPaise`, `outstandingBalancePaise`, `amountPaise`, etc.
- IDs: `uuid().primaryKey().defaultRandom()`
- Timestamps: `timestamp().defaultNow().notNull()`
- Soft delete products/customers: `isActive: boolean` — never hard delete
- `billItems` snapshots `productName`, `productSku`, `unitPricePaise`, `gstRate` at time of sale
- Relations: stable `relations` API from `drizzle-orm` — NOT v1 beta `defineRelations`
- Low stock threshold: `reorderLevel` column (NOT `lowStockThreshold`)
- Products: NO `category` column (planned for v2)
- Bills: `status` values are `"paid"`, `"credit"`, `"partial"` (NOT `"unpaid"`)
- Payments: `paymentMethod` column (NOT `paymentMode`)

Tables (app): `shops`, `products`, `customers`, `bills`, `billItems`,
`payments`, `purchases`

Tables (Better Auth, generated): `user`, `session`, `account`,
`verification`

## Business Logic Rules

### Currency

- **Store in paise** (rupees × 100)
- **Display in rupees** using `formatCurrency(paise)` from `lib/utils.ts`
- Always `Math.round()` — never `Math.floor()`
- `en-IN` locale for all displays

```ts
export function formatCurrency(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  })
}
```

### GST Calculation

```ts
const subtotal = unitPricePaise * quantity                    // paise
const gstAmount = Math.round((subtotal * gstRate) / 100)     // paise
const lineTotal = subtotal + gstAmount                       // paise

// Invoice display: split 50/50
const cgst = Math.round(totalGst / 2)
const sgst = totalGst - cgst   // handles odd paise correctly
```

Valid GST rates: `0 | 5 | 12 | 18 | 28` only (defined in `constants/index.ts`).

### Invoice Number Generation

- Format: `INV-0001` (4-digit, zero-padded, per-shop)
- Prefix stored in `shops.invoicePrefix` (default `"INV"`)
- Next number tracked in `shops.nextInvoiceNumber`
- Must be generated inside the bill creation DB transaction
- Use `SELECT COUNT(*) ...` for now; v2: use `nextInvoiceNumber` with atomic increment

### Bill Creation Transaction

Current implementation (v1) — all or nothing:

1. Generate invoice number (count-based)
2. Calculate totals per line item
3. Insert `bills` record
4. Insert `billItems` with name/price/sku snapshots
5. Deduct stock from `products` table using row-level locks (`FOR UPDATE`) to prevent overselling
6. Update `customer.outstandingBalancePaise` if status ≠ paid

**⚠️ Known gaps:**
- Need UI support for `discountPaise` during bill creation.

### Customer Balance

- Denormalized `outstandingBalancePaise` on `customers` table
- Positive = customer owes shop (udhar)
- Always updated inside transaction with related bill/payment
- Column name: `outstandingBalancePaise` (NOT `outstandingBalance`)

## Design System

### Colors

```
Light mode:
  --background:   warm off-white
  --foreground:   warm near-black
  --primary:      deep forest green (#166534)
  --border:       #e5e5e0

Dark mode:
  --background:   green-tinted dark
  --primary:      oklch(0.520 0.130 151)
```

### Typography

- **UI**: DM Sans 400/500 — `next/font/google`
- **Display**: Instrument Serif — invoices, large amounts, wordmark ONLY
- **Mono**: DM Mono — ALL rupee amounts, codes, phone numbers, IDs

### Component Rules

- Max radius: `rounded` (6px). No `rounded-full` on buttons.
- Shadows: `shadow-sm` only
- No gradients. No illustrations. No mascots.
- Table rows: 48px default, 40px on `/bills/new`

### Status Badges

```tsx
// Bill status — uses "credit" not "unpaid"
// paid → green, partial → amber, credit → red
<Badge className="bg-green-50 text-green-700 border border-green-200">Paid</Badge>
<Badge className="bg-amber-50 text-amber-700 border border-amber-200">Partial</Badge>
<Badge className="bg-red-50 text-red-700 border border-red-200">Credit</Badge>
```

### Stock Badges

```tsx
// Based on stockQty vs reorderLevel
<Badge className="bg-green-50 ...">In Stock</Badge>      // stockQty > reorderLevel
<Badge className="bg-amber-50 ...">Low Stock</Badge>     // 0 < stockQty <= reorderLevel
<Badge className="bg-red-50 ...">Out of Stock</Badge>    // stockQty === 0
```

## Environment Variables

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## What NOT to Do

- ❌ Store rupees in DB — always paise (column names end in `Paise`)
- ❌ `Math.floor()` for money — always `Math.round()`
- ❌ Synchronous `params` in pages — always `await params`
- ❌ `middleware.ts` — use `proxy.ts`
- ❌ Drizzle v1 beta `defineRelations` — use stable `relations`
- ❌ `import { betterAuth } from "better-auth"` with drizzle — use `better-auth/minimal`
- ❌ `import { createAuthClient } from "better-auth/client"` — use `better-auth/react`
- ❌ Better Auth Organization plugin — not needed in MVP
- ❌ Access `session.session.shopId` — use `getShopByUserId(session.user.id)` instead (patterns are cached)
- ❌ Hard delete products or customers — set `isActive = false`
- ❌ Create bills outside a DB transaction
- ❌ Display currency without `formatCurrency()` helper
- ❌ `Math.floor()` for GST split — always `Math.round()`
- ❌ `rounded-full` on buttons
- ❌ Gradients anywhere
- ❌ `font-sans` for rupee amounts — always `font-mono`
- ❌ Generic dashboard with vanity metrics — show actionable shopkeeper data
- ❌ Use `salePrice` / `purchasePrice` — actual columns: `unitPricePaise` / `mrpPaise`
- ❌ Use `lowStockThreshold` — actual column: `reorderLevel`
- ❌ Use `outstandingBalance` — actual column: `outstandingBalancePaise`
- ❌ Use `paymentMode` — actual column: `paymentMethod`
- ❌ Use `status: "unpaid"` — actual value: `"credit"`
- ❌ Reference `src/` paths — project has no `src/` directory
- ❌ Reference `db/schema.ts` — actual path: `database/schemas/`
- ❌ Reference `lib/session.ts` — actual path: `lib/get-session.ts`
