import { db } from "@/database";
import { shops } from "../schemas";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const getShopByUserId = cache(
  async (userId: string) => {
    return await db.query.shops.findFirst({
      where: eq(shops.ownerId, userId),
    });
  }
);

export const getShopById = cache(
  async (shopId: string) => {
    return await db.query.shops.findFirst({
      where: eq(shops.id, shopId),
    });
  }
);
