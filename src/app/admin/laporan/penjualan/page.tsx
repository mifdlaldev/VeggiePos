import Link from "next/link";
import { AdminMetric, AdminPageHeader, AdminToolbar } from "@/components/admin-ui";
import { AppShell, MiniInfo, SoftButton, SurfaceCard } from "@/components/veggie-ui";
import { formatDateLabel } from "@/lib/format";
import { adminNavigation } from "@/lib/navigation";
import { getSalesReportData } from "@/lib/reports";

type SalesReportPageProps = {
  searchParams?: Promise<{
    q?: string;
    from?: string;
    to?: string;
  }>;
};

function buildSalesNote(report: Awaited<ReturnType<typeof getSalesReportData>>) {
  if (report.insights.topCashier) {
    return `${report.insights.topCashier.fullName} memimpin ${report.insights.topCashier.transactionCount} transaksi pada rentang ini.`;
  }

  return "Belum ada transaksi pada filter ini. Simpan transaksi dari modul kasir agar laporan mulai terisi.";
}

export default async function SalesReportPage({
  searchParams,
}: SalesReportPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const from = resolvedSearchParams?.from?.trim() ?? "";
  const to = resolvedSearchParams?.to?.trim() ?? "";
  const report = await getSalesReportData({ query, from, to });

  return (
    <AppShell
      role="Admin"
      subtitle="Ringkasan performa penjualan harian dan periodik."
      noteTitle="Insight Penjualan"
      noteText={buildSalesNote(report)}
      navigation={adminNavigation}
      currentPath="/admin/laporan/penjualan"
    >
      <AdminPageHeader
        eyebrow="Admin • Laporan Penjualan"
        title="Laporan Penjualan"
        description="Pantau omzet, jumlah transaksi, dan performa kasir dari data transaksi yang benar-benar tersimpan. Filter periode dan pencarian nota tersedia di satu tempat."
        meta={[
          report.filterLabel,
          `${report.rows.length} transaksi tampil`,
          `Hari ini • ${formatDateLabel(new Date())}`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Catatan Penjualan
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {buildSalesNote(report)}
            </p>
          </div>
        }
      />

      <AdminToolbar>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SoftButton>{report.filterLabel}</SoftButton>
          </div>

          <form
            method="get"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_200px_200px_auto_auto]"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari kode transaksi, kasir, atau produk..."
              className="min-h-13 flex-1 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
            />
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="min-h-13 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none"
            />
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="min-h-13 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              className="rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white whitespace-nowrap"
            >
              Terapkan
            </button>
            {report.appliedFiltersCount > 0 ? (
              <Link
                href="/admin/laporan/penjualan"
                className="rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-center text-sm font-semibold text-[var(--danger)] whitespace-nowrap"
              >
                Reset
              </Link>
            ) : null}
          </form>
        </div>
      </AdminToolbar>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Total Omzet"
          value={report.stats.totalRevenueLabel}
          note="Akumulasi nominal transaksi pada periode aktif."
          tone="good"
        />
        <AdminMetric
          label="Jumlah Transaksi"
          value={String(report.stats.transactionCount)}
          note="Total nota yang cocok dengan filter saat ini."
          tone="neutral"
        />
        <AdminMetric
          label="Rata-rata Belanja"
          value={report.stats.averageTicketLabel}
          note="Nilai rata-rata belanja per transaksi pada periode aktif."
          tone="good"
        />
        <AdminMetric
          label="Kasir Teratas"
          value={report.stats.topCashierLabel}
          note={`${report.stats.activeCashierCount} kasir muncul pada data yang sedang dilihat.`}
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.22fr_0.98fr]">
        <SurfaceCard
          title="Riwayat Transaksi"
          description="Daftar ini mengikuti filter aktif, sehingga admin bisa meninjau nota per periode tanpa angka palsu dari mock data."
          action={<SoftButton>{report.rows.length} transaksi</SoftButton>}
        >
          {report.rows.length > 0 ? (
            <div className="grid gap-3">
              {report.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1fr_0.95fr_0.85fr_0.8fr_0.8fr]"
                >
                  <div>
                    <p className="font-semibold">{row.code}</p>
                    <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                      {row.productSummary || "Tanpa detail produk"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">{row.cashierName}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      @{row.cashierUsername}
                    </p>
                  </div>
                  <span className="text-[var(--muted)]">
                    {row.dateLabel} • {row.timeLabel}
                  </span>
                  <span className="text-[var(--muted)]">{row.itemCount} item</span>
                  <span className="font-semibold">{row.totalLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-sm leading-7 text-[var(--muted)]">
              Tidak ada transaksi yang cocok dengan filter saat ini.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          title="Ringkasan Cepat"
          description="Panel ini merangkum sinyal utama agar admin bisa membaca performa penjualan lebih cepat."
          action={<SoftButton>Insight Real</SoftButton>}
        >
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              <MiniInfo
                label="Kasir Teraktif"
                value={report.insights.topCashier?.fullName ?? "Belum ada"}
              />
              <MiniInfo
                label="Produk Terlaris"
                value={report.insights.topProduct?.name ?? "Belum ada"}
              />
              <MiniInfo
                label="Nota Terbaru"
                value={report.insights.latestTransaction?.code ?? "Belum ada"}
              />
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Performa Kasir
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                {report.insights.topCashier?.fullName ?? "Belum ada transaksi"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {report.insights.topCashier
                  ? `${report.insights.topCashier.transactionCount} transaksi dengan omzet ${report.insights.topCashier.totalRevenueLabel}.`
                  : "Kasir teratas akan muncul setelah ada transaksi tersimpan."}
              </p>
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Produk Penarik Omzet
              </p>
              <p className="mt-2 font-semibold text-[var(--foreground)]">
                {report.insights.topProduct?.name ?? "Belum ada produk terlaris"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {report.insights.topProduct
                  ? `${report.insights.topProduct.quantitySold} item terjual dengan omzet ${report.insights.topProduct.revenueLabel}.`
                  : "Produk terlaris akan tampil setelah transaksi pertama masuk."}
              </p>
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Nota Terakhir
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {report.insights.latestTransaction
                  ? `${report.insights.latestTransaction.code} tercatat pada ${report.insights.latestTransaction.timeLabel} dengan total ${report.insights.latestTransaction.totalLabel}.`
                  : "Belum ada nota yang tersimpan pada rentang ini."}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </section>
    </AppShell>
  );
}
