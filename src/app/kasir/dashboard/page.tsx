import Link from "next/link";
import {
  AppShell,
  SoftButton,
  SurfaceCard,
} from "@/components/veggie-ui";
import { CashierMetric, CashierPageHeader } from "@/components/cashier-ui";
import { requireRole } from "@/lib/auth/session";
import { formatDateLabel, formatRupiah } from "@/lib/format";
import { cashierNavigation } from "@/lib/navigation";
import { getProductStats } from "@/lib/products";
import {
  getCashierHistoryRows,
  getCashierTransactionStats,
} from "@/lib/transactions";

export default async function CashierDashboardPage() {
  const session = await requireRole("KASIR");
  const [productStats, transactionStats, recentTransactions] = await Promise.all([
    getProductStats(),
    getCashierTransactionStats(session.userId),
    getCashierHistoryRows(session.userId, undefined, 3),
  ]);

  return (
    <AppShell
      role="Kasir"
      subtitle="Shift pagi • transaksi cepat dan jelas."
      noteTitle="Tips Shift"
      noteText={
        transactionStats.latestTransactionCode
          ? `Transaksi terakhir ${transactionStats.latestTransactionCode} sudah tersimpan. Ada ${productStats.lowStockCount} produk dengan stok rendah.`
          : `Ada ${productStats.lowStockCount} produk dengan stok rendah. Cek sebelum antrean mulai ramai.`
      }
      navigation={cashierNavigation}
      currentPath="/kasir/dashboard"
    >
      <CashierPageHeader
        eyebrow="Kasir • Area Kerja"
        title="Dashboard Shift"
        description="Halaman ini merangkum kondisi kasir saat ini: jumlah transaksi, omzet hari ini, produk yang siap dijual, dan nota terbaru dari akun yang sedang aktif."
        meta={[
          session.fullName,
          `Hari ini • ${formatDateLabel(new Date())}`,
          `${productStats.lowStockCount} stok rendah`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Prioritas Shift
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {transactionStats.latestTransactionCode
                ? `Lanjutkan kerja dari transaksi berikutnya. Nota terakhir ${transactionStats.latestTransactionCode} sudah tersimpan.`
                : "Belum ada transaksi hari ini. Buka modul transaksi untuk membuat nota pertama."}
            </p>
            <Link href="/kasir/transaksi" className="mt-4 inline-block">
              <SoftButton>Buka Transaksi</SoftButton>
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <CashierMetric
          label="Transaksi Hari Ini"
          value={String(transactionStats.todayTransactionCount)}
          note="Jumlah nota yang tersimpan oleh akun kasir ini hari ini."
          tone="good"
        />
        <CashierMetric
          label="Penjualan Hari Ini"
          value={formatRupiah(transactionStats.todaySalesTotal)}
          note="Total nominal transaksi yang sudah berhasil disimpan."
          tone="neutral"
        />
        <CashierMetric
          label="Produk Siap Scan"
          value={String(productStats.totalProducts)}
          note={`${productStats.lowStockCount} produk perlu diperhatikan sebelum antrean ramai.`}
          tone="good"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.95fr]">
        <SurfaceCard
          title="Riwayat Nota Terbaru"
          description="Tiga transaksi terakhir dari akun kasir aktif. Daftar ini bisa dipakai untuk cek cepat sebelum membuka riwayat lengkap."
          action={
            <Link href="/kasir/riwayat">
              <SoftButton>Lihat Semua Riwayat</SoftButton>
            </Link>
          }
        >
          {recentTransactions.length > 0 ? (
            <div className="grid gap-3">
              {recentTransactions.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1fr_0.9fr_0.8fr_0.8fr]"
                >
                  <span className="font-semibold">{row.code}</span>
                  <span className="text-[var(--muted)]">{row.dateLabel}</span>
                  <span className="text-[var(--muted)]">{row.timeLabel}</span>
                  <span className="font-semibold">{row.totalLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-sm leading-7 text-[var(--muted)]">
              Belum ada transaksi tersimpan untuk akun kasir ini.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          title="Kondisi Operasional"
          description="Ringkasan singkat ini membantu kasir mengambil keputusan cepat sebelum mulai atau melanjutkan shift."
        >
          <div className="grid gap-4">
            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Nota Terakhir
              </p>
              <p className="mt-2 font-semibold text-[var(--foreground)]">
                {transactionStats.latestTransactionCode ?? "Belum ada nota tersimpan"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {transactionStats.latestTransactionCode
                  ? "Gunakan riwayat jika perlu cek ulang detail nota terbaru."
                  : "Nota terakhir akan muncul di sini setelah transaksi pertama disimpan."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Status Stok
              </p>
              <p className="mt-2 font-semibold text-[var(--foreground)]">
                {productStats.lowStockCount > 0
                  ? `${productStats.lowStockCount} produk stok rendah`
                  : "Semua produk pada batas aman"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Produk dengan stok rendah sebaiknya diperhatikan sebelum transaksi besar disimpan.
              </p>
            </div>
            <div className="rounded-[18px] bg-[rgba(216,233,203,0.45)] p-4 text-sm leading-7 text-[var(--olive-deep)]">
              Meja kerja kasir sudah siap dipakai. Kalau ingin langsung jual, buka
              modul transaksi dan mulai dari daftar produk di sisi kiri.
            </div>
          </div>
        </SurfaceCard>
      </section>
    </AppShell>
  );
}
