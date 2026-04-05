import "server-only";

import { getDb } from "@/lib/db";

export const LOW_STOCK_THRESHOLD = 10;

export type ProductFormValues = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

function normalizeQuery(query?: string) {
  return query?.trim() ?? "";
}

function productQueryWhere(query?: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {};
  }

  return {
    OR: [
      {
        name: {
          contains: normalizedQuery,
          mode: "insensitive" as const,
        },
      },
    ],
  };
}

export async function getProducts(query?: string) {
  const db = getDb();

  return db.product.findMany({
    where: productQueryWhere(query),
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });
}

export async function getProductById(id: number) {
  const db = getDb();

  return db.product.findUnique({
    where: { id },
  });
}

export async function getProductStats(query?: string) {
  const products = await getProducts(query);
  const totalProducts = products.length;
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0,
  );
  const lowStockCount = products.filter(
    (product) => product.stock <= LOW_STOCK_THRESHOLD,
  ).length;

  return {
    totalProducts,
    inventoryValue,
    lowStockCount,
  };
}

export async function getProductsNeedingAttention(limit = 3) {
  const db = getDb();

  return db.product.findMany({
    orderBy: [{ stock: "asc" }, { name: "asc" }],
    take: limit,
  });
}

export function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "habis",
      tone: "warn" as const,
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "rendah",
      tone: "warn" as const,
    };
  }

  return {
    label: "aman",
    tone: "good" as const,
  };
}
