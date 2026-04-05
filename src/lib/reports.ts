import "server-only";

import { getDb } from "@/lib/db";
import { formatDateLabel, formatRupiah, formatTimeLabel } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, getStockStatus } from "@/lib/products";
import { formatTransactionCode } from "@/lib/transactions";

type SalesReportFilters = {
  query?: string;
  from?: string;
  to?: string;
};

type StockStatusFilter = "SEMUA" | "AMAN" | "RENDAH" | "HABIS";

type StockReportFilters = {
  query?: string;
  status?: string;
};

export type SalesReportRow = {
  id: number;
  code: string;
  cashierName: string;
  cashierUsername: string;
  dateLabel: string;
  timeLabel: string;
  totalAmount: number;
  totalLabel: string;
  itemCount: number;
  productSummary: string;
};

export type SalesReportData = {
  rows: SalesReportRow[];
  stats: {
    totalRevenue: number;
    totalRevenueLabel: string;
    transactionCount: number;
    averageTicket: number;
    averageTicketLabel: string;
    activeCashierCount: number;
    topCashierLabel: string;
  };
  insights: {
    topCashier:
      | {
          fullName: string;
          transactionCount: number;
          totalRevenueLabel: string;
        }
      | null;
    topProduct:
      | {
          name: string;
          quantitySold: number;
          revenueLabel: string;
        }
      | null;
    latestTransaction:
      | {
          code: string;
          timeLabel: string;
          totalLabel: string;
        }
      | null;
  };
  filterLabel: string;
  appliedFiltersCount: number;
};

export type StockReportRow = {
  id: number;
  name: string;
  stock: number;
  priceLabel: string;
  stockValueLabel: string;
  statusLabel: string;
  statusTone: "good" | "warn";
  actionLabel: string;
};

export type StockReportData = {
  rows: StockReportRow[];
  stats: {
    totalProducts: number;
    inventoryValueLabel: string;
    safeCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    coverageRate: number;
  };
  insights: {
    restockPriorities: Array<{
      id: number;
      name: string;
      stock: number;
      actionLabel: string;
      statusLabel: string;
    }>;
    highestValueProduct:
      | {
          name: string;
          stockValueLabel: string;
        }
      | null;
    lowestStockProduct:
      | {
          name: string;
          stock: number;
        }
      | null;
  };
  statusFilter: StockStatusFilter;
  filteredCount: number;
  appliedFiltersCount: number;
};

function normalizeQuery(query?: string) {
  return query?.trim() ?? "";
}

function parseDateInput(value?: string) {
  const normalized = value?.trim() ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const [year, month, day] = normalized.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function buildTransactionDateFilter(from?: string, to?: string) {
  const startDate = parseDateInput(from);
  const endDate = parseDateInput(to);

  if (!startDate && !endDate) {
    return {};
  }

  return {
    transactionDate: {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate
        ? {
            lt: new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate() + 1,
            ),
          }
        : {}),
    },
  };
}

function buildDateFilterLabel(from?: string, to?: string) {
  const startDate = parseDateInput(from);
  const endDate = parseDateInput(to);

  if (startDate && endDate) {
    if (from === to) {
      return formatDateLabel(startDate);
    }

    return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
  }

  if (startDate) {
    return `Sejak ${formatDateLabel(startDate)}`;
  }

  if (endDate) {
    return `Sampai ${formatDateLabel(endDate)}`;
  }

  return "Semua tanggal";
}

function countAppliedFilters(filters: Array<string | undefined>) {
  return filters.filter((value) => Boolean(value?.trim())).length;
}

function normalizeStockStatusFilter(value?: string): StockStatusFilter {
  if (value === "AMAN" || value === "RENDAH" || value === "HABIS") {
    return value;
  }

  return "SEMUA";
}

function matchesStockFilter(stock: number, filter: StockStatusFilter) {
  if (filter === "AMAN") {
    return stock > LOW_STOCK_THRESHOLD;
  }

  if (filter === "RENDAH") {
    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  }

  if (filter === "HABIS") {
    return stock <= 0;
  }

  return true;
}

export async function getSalesReportData(filters: SalesReportFilters): Promise<SalesReportData> {
  const db = getDb();
  const normalizedQuery = normalizeQuery(filters.query).toLowerCase();

  const transactions = await db.transaction.findMany({
    where: buildTransactionDateFilter(filters.from, filters.to),
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          username: true,
        },
      },
      transactionDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  const filteredTransactions = transactions.filter((transaction) => {
    if (!normalizedQuery) {
      return true;
    }

    const dateLabel = formatDateLabel(transaction.transactionDate);
    const timeLabel = formatTimeLabel(transaction.transactionDate);
    const totalLabel = formatRupiah(transaction.totalAmount);
    const code = formatTransactionCode(transaction.id);
    const productSummary = transaction.transactionDetails
      .map((detail) => detail.product.name)
      .join(" ");

    return [
      code,
      transaction.user.fullName,
      transaction.user.username,
      dateLabel,
      timeLabel,
      totalLabel,
      productSummary,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const rows = filteredTransactions.map((transaction) => ({
    id: transaction.id,
    code: formatTransactionCode(transaction.id),
    cashierName: transaction.user.fullName,
    cashierUsername: transaction.user.username,
    dateLabel: formatDateLabel(transaction.transactionDate),
    timeLabel: formatTimeLabel(transaction.transactionDate),
    totalAmount: transaction.totalAmount,
    totalLabel: formatRupiah(transaction.totalAmount),
    itemCount: transaction.transactionDetails.reduce(
      (total, detail) => total + detail.quantity,
      0,
    ),
    productSummary: transaction.transactionDetails
      .map((detail) => detail.product.name)
      .join(", "),
  }));

  const totalRevenue = filteredTransactions.reduce(
    (total, transaction) => total + transaction.totalAmount,
    0,
  );
  const transactionCount = filteredTransactions.length;
  const averageTicket = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

  const cashierMap = new Map<
    number,
    {
      fullName: string;
      username: string;
      transactionCount: number;
      totalRevenue: number;
    }
  >();
  const productMap = new Map<
    number,
    {
      name: string;
      quantitySold: number;
      revenue: number;
    }
  >();

  for (const transaction of filteredTransactions) {
    const cashierEntry = cashierMap.get(transaction.user.id) ?? {
      fullName: transaction.user.fullName,
      username: transaction.user.username,
      transactionCount: 0,
      totalRevenue: 0,
    };

    cashierEntry.transactionCount += 1;
    cashierEntry.totalRevenue += transaction.totalAmount;
    cashierMap.set(transaction.user.id, cashierEntry);

    for (const detail of transaction.transactionDetails) {
      const productEntry = productMap.get(detail.product.id) ?? {
        name: detail.product.name,
        quantitySold: 0,
        revenue: 0,
      };

      productEntry.quantitySold += detail.quantity;
      productEntry.revenue += detail.subtotal;
      productMap.set(detail.product.id, productEntry);
    }
  }

  const topCashier =
    Array.from(cashierMap.values()).sort((left, right) => {
      if (right.transactionCount !== left.transactionCount) {
        return right.transactionCount - left.transactionCount;
      }

      return right.totalRevenue - left.totalRevenue;
    })[0] ?? null;

  const topProduct =
    Array.from(productMap.values()).sort((left, right) => {
      if (right.quantitySold !== left.quantitySold) {
        return right.quantitySold - left.quantitySold;
      }

      return right.revenue - left.revenue;
    })[0] ?? null;

  const latestTransaction = rows[0]
    ? {
        code: rows[0].code,
        timeLabel: `${rows[0].dateLabel} • ${rows[0].timeLabel}`,
        totalLabel: rows[0].totalLabel,
      }
    : null;

  return {
    rows,
    stats: {
      totalRevenue,
      totalRevenueLabel: formatRupiah(totalRevenue),
      transactionCount,
      averageTicket,
      averageTicketLabel: formatRupiah(averageTicket),
      activeCashierCount: cashierMap.size,
      topCashierLabel: topCashier ? topCashier.fullName : "Belum ada",
    },
    insights: {
      topCashier: topCashier
        ? {
            fullName: topCashier.fullName,
            transactionCount: topCashier.transactionCount,
            totalRevenueLabel: formatRupiah(topCashier.totalRevenue),
          }
        : null,
      topProduct: topProduct
        ? {
            name: topProduct.name,
            quantitySold: topProduct.quantitySold,
            revenueLabel: formatRupiah(topProduct.revenue),
          }
        : null,
      latestTransaction,
    },
    filterLabel: buildDateFilterLabel(filters.from, filters.to),
    appliedFiltersCount: countAppliedFilters([filters.query, filters.from, filters.to]),
  };
}

export async function getStockReportData(filters: StockReportFilters): Promise<StockReportData> {
  const db = getDb();
  const normalizedQuery = normalizeQuery(filters.query).toLowerCase();
  const statusFilter = normalizeStockStatusFilter(filters.status);

  const products = await db.product.findMany({
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  const filteredProducts = products.filter((product) => {
    const matchesQuery = normalizedQuery
      ? product.name.toLowerCase().includes(normalizedQuery)
      : true;

    return matchesQuery && matchesStockFilter(product.stock, statusFilter);
  });

  const safeCount = products.filter((product) => product.stock > LOW_STOCK_THRESHOLD).length;
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const outOfStockCount = products.filter((product) => product.stock <= 0).length;
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0,
  );
  const coverageRate =
    products.length > 0 ? Math.round((safeCount / products.length) * 100) : 0;

  const rows = filteredProducts.map((product) => {
    const status = getStockStatus(product.stock);

    return {
      id: product.id,
      name: product.name,
      stock: product.stock,
      priceLabel: formatRupiah(product.price),
      stockValueLabel: formatRupiah(product.price * product.stock),
      statusLabel: status.label,
      statusTone: status.tone,
      actionLabel:
        product.stock <= 0
          ? "Restock sekarang"
          : product.stock <= LOW_STOCK_THRESHOLD
            ? "Pantau & tambah stok"
            : "Aman dipertahankan",
    };
  });

  const restockPriorities = products
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      statusLabel: getStockStatus(product.stock).label,
      actionLabel:
        product.stock <= 0 ? "Restock sekarang" : "Prioritas shift berikutnya",
    }));

  const highestValueProduct =
    [...products]
      .sort(
        (left, right) =>
          right.price * right.stock - left.price * left.stock || left.name.localeCompare(right.name),
      )[0] ?? null;

  const lowestStockProduct =
    [...products].sort((left, right) => left.stock - right.stock || left.name.localeCompare(right.name))[0] ??
    null;

  return {
    rows,
    stats: {
      totalProducts: products.length,
      inventoryValueLabel: formatRupiah(inventoryValue),
      safeCount,
      lowStockCount,
      outOfStockCount,
      coverageRate,
    },
    insights: {
      restockPriorities,
      highestValueProduct: highestValueProduct
        ? {
            name: highestValueProduct.name,
            stockValueLabel: formatRupiah(
              highestValueProduct.price * highestValueProduct.stock,
            ),
          }
        : null,
      lowestStockProduct: lowestStockProduct
        ? {
            name: lowestStockProduct.name,
            stock: lowestStockProduct.stock,
          }
        : null,
    },
    statusFilter,
    filteredCount: rows.length,
    appliedFiltersCount: countAppliedFilters([
      filters.query,
      statusFilter === "SEMUA" ? undefined : statusFilter,
    ]),
  };
}
