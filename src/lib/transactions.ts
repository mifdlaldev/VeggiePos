import "server-only";

import { getDb } from "@/lib/db";
import { formatDateLabel, formatRupiah, formatTimeLabel } from "@/lib/format";

export type TransactionReceiptItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type TransactionReceipt = {
  id: number;
  code: string;
  cashierName: string;
  cashierUsername: string;
  dateLabel: string;
  timeLabel: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  itemCount: number;
  items: TransactionReceiptItem[];
};

export type TransactionHistoryRow = {
  id: number;
  code: string;
  cashierName: string;
  dateLabel: string;
  timeLabel: string;
  totalAmount: number;
  totalLabel: string;
  paidAmountLabel: string;
  changeAmountLabel: string;
  itemCount: number;
};

function getTodayRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function formatTransactionCode(id: number) {
  return `TRX-${String(id).padStart(5, "0")}`;
}

function mapReceipt(transaction: {
  id: number;
  transactionDate: Date;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  user: {
    username: string;
    fullName: string;
  };
  transactionDetails: Array<{
    quantity: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
  }>;
}): TransactionReceipt {
  const items = transaction.transactionDetails.map((detail) => ({
    productId: detail.product.id,
    productName: detail.product.name,
    quantity: detail.quantity,
    unitPrice: detail.product.price,
    subtotal: detail.subtotal,
  }));

  return {
    id: transaction.id,
    code: formatTransactionCode(transaction.id),
    cashierName: transaction.user.fullName,
    cashierUsername: transaction.user.username,
    dateLabel: formatDateLabel(transaction.transactionDate),
    timeLabel: formatTimeLabel(transaction.transactionDate),
    totalAmount: transaction.totalAmount,
    paidAmount: transaction.paidAmount,
    changeAmount: transaction.changeAmount,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    items,
  };
}

function mapHistoryRow(transaction: {
  id: number;
  transactionDate: Date;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  user: {
    fullName: string;
  };
  transactionDetails: Array<{
    quantity: number;
  }>;
}): TransactionHistoryRow {
  const itemCount = transaction.transactionDetails.reduce(
    (total, detail) => total + detail.quantity,
    0,
  );

  return {
    id: transaction.id,
    code: formatTransactionCode(transaction.id),
    cashierName: transaction.user.fullName,
    dateLabel: formatDateLabel(transaction.transactionDate),
    timeLabel: formatTimeLabel(transaction.transactionDate),
    totalAmount: transaction.totalAmount,
    totalLabel: formatRupiah(transaction.totalAmount),
    paidAmountLabel: formatRupiah(transaction.paidAmount),
    changeAmountLabel: formatRupiah(transaction.changeAmount),
    itemCount,
  };
}

function transactionMatchesQuery(row: TransactionHistoryRow, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    row.code.toLowerCase(),
    row.dateLabel.toLowerCase(),
    row.timeLabel.toLowerCase(),
    row.totalLabel.toLowerCase(),
  ].some((value) => value.includes(normalizedQuery));
}

export async function getCashierTransactionStats(userId: number) {
  const db = getDb();
  const { start, end } = getTodayRange();

  const [todayAggregate, latestTransaction] = await Promise.all([
    db.transaction.aggregate({
      where: {
        userId,
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    }),
    db.transaction.findFirst({
      where: { userId },
      orderBy: {
        transactionDate: "desc",
      },
      select: {
        id: true,
      },
    }),
  ]);

  return {
    todayTransactionCount: todayAggregate._count._all,
    todaySalesTotal: todayAggregate._sum.totalAmount ?? 0,
    latestTransactionCode: latestTransaction
      ? formatTransactionCode(latestTransaction.id)
      : null,
  };
}

export async function getCashierHistoryRows(
  userId: number,
  query?: string,
  limit = 20,
) {
  const db = getDb();
  const normalizedQuery = query?.trim() ?? "";
  const take = normalizedQuery ? Math.max(limit * 3, 30) : limit;

  const transactions = await db.transaction.findMany({
    where: { userId },
    orderBy: {
      transactionDate: "desc",
    },
    include: {
      user: {
        select: {
          fullName: true,
        },
      },
      transactionDetails: {
        select: {
          quantity: true,
        },
      },
    },
    take,
  });

  const rows = transactions.map(mapHistoryRow);

  return rows.filter((row) => transactionMatchesQuery(row, normalizedQuery)).slice(0, limit);
}

export async function getCashierReceiptById(userId: number, transactionId: number) {
  const db = getDb();

  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
      transactionDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  return transaction ? mapReceipt(transaction) : null;
}

export async function getLatestCashierReceipt(userId: number) {
  const db = getDb();

  const transaction = await db.transaction.findFirst({
    where: { userId },
    orderBy: {
      transactionDate: "desc",
    },
    include: {
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
      transactionDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  return transaction ? mapReceipt(transaction) : null;
}
