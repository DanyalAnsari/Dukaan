# Dukaan contributor guide

Read `PROJECT.md` before changing application behavior. It is the source of truth for architecture, business rules, and access control.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Do not run `pnpm db:seed` without approval: it truncates tables.

## Rules

- Use App Router server components for data loading and Server Actions for mutations. Route handlers are reserved for external/webhook or binary endpoints.
- Await `params` and `searchParams` in Next.js 16 routes.
- Use `requireShop()` for shop-scoped access and `requireShopRole()` for privileged access. Preserve `shopId` filters on every query and mutation.
- Keep money in paise. Never use floating-point rupee values for stored calculations.
- Preserve bill-item snapshots and the atomic invoice-number transaction.
- Use Zod at input boundaries, Drizzle migrations for schema changes, and `revalidatePath()` after mutations.
- Reuse installed shadcn/ui components and semantic design tokens. Read `.agents/skills/shadcn/SKILL.md` before UI work.
- Add native Next.js `loading.tsx`, `error.tsx`, `not-found.tsx`, `unauthorized.tsx`, or `forbidden.tsx` boundaries when a route family needs them.
- Preserve unrelated uncommitted work. Run `pnpm typecheck`, `pnpm lint`, and `git diff --check` before handoff.
