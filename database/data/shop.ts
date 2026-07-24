import { db } from "@/database";
import { member, shops } from "../schemas";
import { and, eq, exists, or } from "drizzle-orm";
import { cache } from "react";

export const getShopByUserId = cache(
  async (userId: string) => {
    return db.query.shops.findFirst({
      where: or(
        eq(shops.ownerId, userId),
        exists(
          db
            .select()
            .from(member)
            .where(
              and(
                eq(member.organizationId, shops.organizationId),
                eq(member.userId, userId)
              )
            )
        )
      ),
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
