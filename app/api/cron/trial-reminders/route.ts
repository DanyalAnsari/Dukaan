import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/database";
import { organization, subscription, user, member } from "@/database/schemas";
import { sendTrialEndingEmail } from "@/lib/email";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const trials = await db
    .select({ email: user.email, trialEnd: subscription.trialEnd })
    .from(subscription)
    .innerJoin(organization, eq(subscription.referenceId, organization.id))
    .innerJoin(member, and(eq(member.organizationId, organization.id), eq(member.role, "owner")))
    .innerJoin(user, eq(user.id, member.userId))
    .where(and(eq(subscription.status, "trialing"), gte(subscription.trialEnd, now), lte(subscription.trialEnd, deadline)));

  await Promise.all(
    trials.map(({ email, trialEnd }) =>
      sendTrialEndingEmail(email, Math.max(1, Math.ceil((trialEnd!.getTime() - now.getTime()) / 86_400_000)))
    )
  );
  return Response.json({ sent: trials.length });
}
