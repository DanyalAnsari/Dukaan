import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";

export async function requireShop() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  return { session, shop };
}
