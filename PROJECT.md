# Dukaan project guide

## Purpose

Dukaan is a multi-tenant POS and business-management app for Indian kiranas. A shop maps to a Better Auth organization; `shopId` is the application tenant boundary.

## Architecture

- Next.js 16 App Router, TypeScript, Tailwind CSS, and shadcn/ui.
- Drizzle ORM with PostgreSQL. Schema: `database/schemas`; migrations: `database/migrations`.
- Better Auth supplies email/password sessions, organizations, invitations, and Stripe subscription data.
- `lib/require-shop.ts` is the authorization gateway. `requireShop()` establishes the session/shop context; `requireShopRole()` gates owner/admin capabilities.
- Plan limits are in `lib/plan-limits.ts`. Stripe is optional locally; missing Stripe configuration results in the Free plan.
- Client cart state uses Zustand. Do not treat browser state as authoritative; validate product, stock, customer, and payment data in the bill action.

## Domain invariants

- Money is stored as integer paise.
- Bills, payments, products, purchases, and customers are always tenant-scoped by `shopId`.
- Bill creation validates stock, creates immutable item snapshots, updates stock, advances the invoice number atomically, and updates balances in one transaction.
- Walk-in customers cannot receive credit or make partial payments.
- Registered-customer credit cannot exceed the configured credit limit.
- General payments use FIFO allocation to oldest unsettled bills.
- Products and customers are soft-deleted where applicable.

## Access model

- Unauthenticated dashboard access uses `unauthorized()`.
- A shop owner is the organization owner. Staff memberships are checked in the Better Auth `member` table.
- Owner-only: settings, billing, and staff management. Owner/admin: reports, exports, and product mutations. Keep new privilege decisions server-side.
- Unknown tenant-scoped records use `notFound()` to avoid cross-shop disclosure.

## Verification

- `pnpm typecheck` and `pnpm lint` are required checks.
- `pnpm build` needs network access to download the Google fonts in `app/layout.tsx`.
- Do not claim a clean full lint unless it has been rerun. TanStack Table currently produces two React Compiler compatibility warnings, not lint errors.

## Documentation policy

Repository documentation is limited to `README.md`, `CLAUDE.md`, and this file. Keep user-facing setup and deployment guidance in the README; keep agent workflow in CLAUDE; keep durable architecture and invariants here.
