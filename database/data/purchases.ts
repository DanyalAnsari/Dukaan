import { db } from "..";

export const getAllPurchases = async (shopId: string) =>
  await db.query.purchases.findMany({
    where: (purchases, { eq }) => eq(purchases.shopId, shopId),
    with: {
      product: true,
    },
    orderBy: (purchases, { desc }) => [desc(purchases.purchaseDate)],
  });
