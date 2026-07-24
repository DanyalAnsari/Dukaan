# Dukaan

Point-of-sale and shop-management software for Indian kiranas and small retailers. Dukaan keeps billing, inventory, customer credit (udhar), GST invoices, staff access, and subscription limits in one workflow.

## What it does

- Creates paid, partial, credit, and draft bills. Walk-in bills must be paid in full.
- Tracks products, stock-in purchases, adjustments, and low-stock items.
- Maintains customer ledgers, credit limits, FIFO payment allocation, and WhatsApp reminders.
- Generates GST-ready PDF invoices with HSN, CGST/SGST, and optional UPI QR codes.
- Provides dashboard charts, reports, GST/Tally exports, and mobile-friendly navigation.
- Supports Free, Starter, and Pro plans with Stripe, plus Better Auth organization-based staff roles.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Drizzle ORM · PostgreSQL/Neon · Better Auth · Stripe · Resend · Zustand · TanStack Table · Recharts · PDFKit

## Local development

Prerequisites: Node.js 20+, pnpm 10+, and PostgreSQL.

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`. Create an account, then finish the shop setup flow.

Useful commands:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

`pnpm db:seed` truncates existing tables before loading sample data; use it only against a disposable database.

## Configuration

Copy `.env.example` to `.env.local`. Required for the core app:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | 32+ character Better Auth secret |
| `BETTER_AUTH_URL` | Canonical application URL |
| `NEXT_PUBLIC_APP_URL` | Browser-visible application URL |

Stripe features require `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, and `STRIPE_PRICE_PRO`. Email and cron features require `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CRON_SECRET`.

## Deploying

Deploy as a Next.js project on Vercel using `pnpm build`. Add the environment variables above, run `pnpm db:migrate` against production, and configure Stripe’s webhook to the Better Auth endpoint. `vercel.json` schedules monthly usage resets plus trial and payment reminders.

The project targets Vercel Mumbai (`bom1`). Production builds fetch the Google fonts declared in `app/layout.tsx`, so build environments need outbound access to `fonts.googleapis.com`.

## Engineering notes

- All currency values are integer paise; format only at the UI boundary.
- Bill item fields are snapshots, preserving historical invoices after product edits.
- Invoice numbers increment atomically inside the bill transaction.
- Server Actions validate input and authorize the current shop before mutation.
- Every tenant query and mutation is scoped by `shopId`; privileged operations also check organization membership and role.
- Dashboard routes use native Next.js loading, error, not-found, unauthorized, and forbidden states.

See [PROJECT.md](PROJECT.md) for architecture and contributor guidance. Agents should also read [CLAUDE.md](CLAUDE.md).

## Resume highlights

- Built a SaaS POS for Indian kiranas covering inventory, GST billing, udhar, purchases, reporting, and PDF invoices.
- Used integer paise, atomic invoice numbers, and FIFO payment allocation to protect financial accuracy.
- Implemented Better Auth organization RBAC and Stripe plan enforcement across server-side mutations.
- Delivered responsive shadcn/ui workflows with Next.js App Router, Drizzle/PostgreSQL, and Vercel Cron jobs.
