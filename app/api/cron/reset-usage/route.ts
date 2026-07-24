import { db } from "@/database";
import { shops } from "@/database/schemas";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await db.update(shops).set({ billsThisMonth: 0 });
  return Response.json({ success: true });
}
