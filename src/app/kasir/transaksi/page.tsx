import { CashierTransactionWorkspace } from "@/components/cashier-transaction-workspace";
import { CashierPageHeader } from "@/components/cashier-ui";
import { AppShell } from "@/components/veggie-ui";
import { requireRole } from "@/lib/auth/session";
import { formatDateLabel } from "@/lib/format";
import { cashierNavigation } from "@/lib/navigation";
import { getProducts, getStockStatus } from "@/lib/products";
import {
  getCashierReceiptById,
  getCashierTransactionStats,
  getLatestCashierReceipt,
} from "@/lib/transactions";

type CashierTransactionPageProps = {
  searchParams?: Promise<{
    status?: string;
    transactionId?: string;
  }>;
};

const statusMessageMap: Record<string, string> = {
  saved: "Transaksi berhasil disimpan dan stok produk sudah diperbarui.",
};

export default async function CashierTransactionPage({
  searchParams,
}: CashierTransactionPageProps) {
  const session = await requireRole("KASIR");
  const resolvedSearchParams = await searchParams;
  const transactionId = Number(resolvedSearchParams?.transactionId);
  const status = resolvedSearchParams?.status ?? "idle";
  const feedback = resolvedSearchParams?.status
    ? statusMessageMap[resolvedSearchParams.status]
    : undefined;

  const [products, transactionStats, selectedReceipt, latestReceipt] = await Promise.all([
    getProducts(),
    getCashierTransactionStats(session.userId),
    Number.isInteger(transactionId) && transactionId > 0
      ? getCashierReceiptById(session.userId, transactionId)
      : Promise.resolve(null),
    getLatestCashierReceipt(session.userId),
  ]);

  const activeReceipt = selectedReceipt ?? latestReceipt;
  const productsReadyCount = products.filter((product) => product.stock > 0).length;
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 10)
    .length;

  return (
    <AppShell
      role="Kasir"
      subtitle={`Shift aktif • ${session.fullName}`}
      noteTitle="Tips Shift"
      noteText={
        lowStockCount > 0
          ? `Ada ${lowStockCount} produk dengan stok rendah. Cek qty sebelum menyimpan transaksi besar.`
          : "Semua produk aktif masih aman untuk dibawa ke meja transaksi."
      }
      navigation={cashierNavigation}
      currentPath="/kasir/transaksi"
    >
      <CashierPageHeader
        eyebrow="Kasir • Transaksi"
        title="Meja Transaksi"
        description="Gunakan halaman ini untuk mencari produk, menambah ke keranjang, menghitung pembayaran, lalu menyimpan nota. Semua stok dan transaksi dibaca langsung dari database."
        meta={[
          session.fullName,
          `Hari ini • ${formatDateLabel(new Date())}`,
          `${productsReadyCount} produk siap jual`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Status Nota
            </p>
            <p className="mt-2 font-semibold text-[var(--foreground)]">
              {activeReceipt ? activeReceipt.code : "Belum ada nota tersimpan"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {lowStockCount > 0
                ? `${lowStockCount} produk stok rendah. Periksa qty sebelum transaksi disimpan.`
                : "Stok aktif dalam kondisi aman untuk diproses di meja kasir."}
            </p>
          </div>
        }
      />

      {feedback ? (
        <div className="rounded-[24px] border border-[#d7e8ca] bg-[rgba(216,233,203,0.45)] p-4 text-sm leading-7 text-[var(--olive-deep)]">
          {feedback}
        </div>
      ) : null}

      <CashierTransactionWorkspace
        key={`${status}:${activeReceipt?.id ?? "new"}`}
        cashierName={session.fullName}
        products={products.map((product) => {
          const stockStatus = getStockStatus(product.stock);

          return {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            statusLabel: stockStatus.label,
            statusTone: stockStatus.tone,
          };
        })}
        todayTransactionCount={transactionStats.todayTransactionCount}
        todaySalesTotal={transactionStats.todaySalesTotal}
        availableProductsCount={productsReadyCount}
        latestReceipt={activeReceipt}
      />
    </AppShell>
  );
}
