import { db } from "..";

export const getLowStockProducts = async (shopId: string) =>
  await db.query.products.findMany({
    where: (products, { and, eq, sql }) =>
      and(
        eq(products.shopId, shopId),
        eq(products.isActive, true),
        sql`${products.stockQty} <= ${products.reorderLevel}`
      ),
    limit: 5,
  });

export const getActiveProducts = async (shopId: string) =>
  await db.query.products.findMany({
    where: (products, { eq, and }) =>
      and(eq(products.shopId, shopId), eq(products.isActive, true)),
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

export const getProductById = async (productId: string, shopId: string) =>
  await db.query.products.findFirst({
    where: (products, { eq, and }) =>
      and(
        eq(products.id, productId),
        eq(products.shopId, shopId),
        eq(products.isActive, true)
      ),
  });
