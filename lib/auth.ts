import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/database";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { and, eq, inArray } from "drizzle-orm";
import {
  member,
  organization as organizationTable,
  subscription,
  user,
} from "@/database/schemas";
import {
  sendPasswordResetEmail,
  sendPaymentFailedEmail,
  sendStaffInviteEmail,
} from "@/lib/email";

export const stripeEnabled = Boolean(
  process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRICE_STARTER &&
    process.env.STRIPE_PRICE_PRO
);

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_unconfigured",
  { apiVersion: "2026-06-24.dahlia" }
);

async function staffLimit(organizationId: string) {
  if (!stripeEnabled) return 0;
  const active = await db.query.subscription.findFirst({
    where: and(
      eq(subscription.referenceId, organizationId),
      inArray(subscription.status, ["active", "trialing"])
    ),
  });
  return active?.plan === "pro" ? 3 : 0;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url);
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 3,
    },
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  plugins: [
    nextCookies(),
    organization({
      allowUserToCreateOrganization: false,
      creatorRole: "owner",
      membershipLimit: async (_user, organization) =>
        (await staffLimit(organization.id)) + 1,
      invitationLimit: async ({ organization }) =>
        staffLimit(organization.id),
      sendInvitationEmail: async (data) =>
        sendStaffInviteEmail(data.email, data.organization.name, data.id),
    }),
    stripe({
            stripeClient,
            stripeWebhookSecret:
              process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_unconfigured",
            createCustomerOnSignUp: stripeEnabled,
            organization: { enabled: true },
            onEvent: async (event) => {
              if (event.type !== "invoice.payment_failed") return;
              const customerId =
                typeof event.data.object.customer === "string"
                  ? event.data.object.customer
                  : event.data.object.customer?.id;
              if (!customerId) return;
              const [owner] = await db
                .select({ email: user.email })
                .from(organizationTable)
                .innerJoin(
                  member,
                  and(
                    eq(member.organizationId, organizationTable.id),
                    eq(member.role, "owner")
                  )
                )
                .innerJoin(user, eq(user.id, member.userId))
                .where(eq(organizationTable.stripeCustomerId, customerId))
                .limit(1);
              if (owner) await sendPaymentFailedEmail(owner.email);
            },
            subscription: {
              enabled: true,
              plans: [
                {
                  name: "starter",
                  priceId: process.env.STRIPE_PRICE_STARTER!,
                  limits: { billsPerMonth: 500, products: 500, customers: -1, staff: 0, pdfInvoices: 1, reports: 0 },
                },
                {
                  name: "pro",
                  priceId: process.env.STRIPE_PRICE_PRO!,
                  limits: { billsPerMonth: -1, products: -1, customers: -1, staff: 3, pdfInvoices: 1, reports: 1 },
                  freeTrial: { days: 14 },
                },
              ],
              authorizeReference: async ({ user, referenceId, action }) => {
                const membership = await db.query.member.findFirst({
                  where: and(
                    eq(member.organizationId, referenceId),
                    eq(member.userId, user.id)
                  ),
                });
                return action === "list-subscription"
                  ? Boolean(membership)
                  : membership?.role === "owner";
              },
            },
          }),
  ],
  basePath: "/api/auth",
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
