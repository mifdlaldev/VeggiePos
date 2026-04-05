import Link from "next/link";
import { AdminMetric, AdminPageHeader, AdminToolbar } from "@/components/admin-ui";
import {
  AppShell,
  MiniInfo,
  SoftButton,
  StatusPill,
  SurfaceCard,
} from "@/components/veggie-ui";
import { formatDateLabel } from "@/lib/format";
import { adminNavigation } from "@/lib/navigation";
import { getStockReportData } from "@/lib/reports";

type StockReportPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

function buildStockNote(report: Awaited<ReturnType<typeof getStockReportData>>) {
  if (report.insights.restockPriorities.length > 0) {
    return `${report.insights.restockPriorities.length} produk perlu prioritas restock pada shift berikutnya.`;
  }

  return "Belum ada produk yang masuk prioritas restock. Inventaris saat ini relatif aman.";
}

export default async function StockReportPage({
  searchParams,
}: StockReportPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const status = resolvedSearchParams?.status?.trim() ?? "SEMUA";
  const report = await getStockReportData({ query, status });

  return (
    <AppShell
      role="Admin"
      subtitle="Kontrol stok sayuran untuk operasional yang lebih siap."
      navigation={adminNavigation}
      currentPath="/admin/laporan/stok"
    >
      <AdminPageHeader
        eyebrow="Admin • Laporan Stok"
        title="Laporan Stok"
        description="Gunakan halaman ini untuk memantau kondisi inventaris, memfilter produk berdasarkan status, dan menentukan prioritas restock dengan data yang selalu mutakhir."
        meta={[
          `${report.filteredCount} produk tampil`,
          `${report.stats.lowStockCount} stok rendah`,
          `Hari ini • ${formatDateLabel(new Date())}`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Catatan Inventaris
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {buildStockNote(report)}
            </p>
          </div>
        }
      />

      <AdminToolbar actions={<SoftButton>Filter {report.statusFilter.toLowerCase()}</SoftButton>}>
          <form method="get" className="flex flex-col gap-3 xl:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nama produk..."
              className="min-h-13 flex-1 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
            />
            <select
              name="status"
              defaultValue={report.statusFilter}
              className="min-h-13 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="AMAN">Aman</option>
              <option value="RENDAH">Stok Rendah</option>
              <option value="HABIS">Habis</option>
            </select>
            <button
              type="submit"
              className="rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white"
            >
              Terapkan
            </button>
            {report.appliedFiltersCount > 0 ? (
              <Link
                href="/admin/laporan/stok"
                className="rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
              >
                Reset
              </Link>
            ) : null}
          </form>
      </AdminToolbar>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Total Produk"
          value={String(report.stats.totalProducts)}
          note="Jumlah seluruh produk yang tercatat di inventaris."
          tone="neutral"
        />
        <AdminMetric
          label="Nilai Inventaris"
          value={report.stats.inventoryValueLabel}
          note="Total nilai stok berdasarkan harga dan jumlah saat ini."
          tone="good"
        />
        <AdminMetric
          label="Stok Rendah"
          value={String(report.stats.lowStockCount)}
          note="Produk yang masih ada, tetapi sudah dekat batas minimal."
          tone="warn"
        />
        <AdminMetric
          label="Produk Habis"
          value={String(report.stats.outOfStockCount)}
          note="Produk tanpa stok yang perlu ditindaklanjuti."
          tone="warn"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.22fr_0.98fr]">
        <SurfaceCard
          title="Rekap Kondisi Stok"
          description="Daftar ini membaca data produk yang sama dengan modul Data Sayuran, sehingga perubahan stok akan langsung tercermin di laporan."
          action={<SoftButton>{report.filteredCount} baris</SoftButton>}
        >
          {report.rows.length > 0 ? (
            <div className="grid gap-3">
              {report.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1.15fr_0.65fr_0.8fr_0.9fr_0.95fr]"
                >
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{row.priceLabel} / item</p>
                  </div>
                  <span className="text-[var(--muted)]">{row.stock} unit</span>
                  <span className="text-[var(--muted)]">{row.stockValueLabel}</span>
                  <StatusPill tone={row.statusTone}>{row.statusLabel}</StatusPill>
                  <span className="text-[var(--muted)]">{row.actionLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-sm leading-7 text-[var(--muted)]">
              Tidak ada produk yang cocok dengan filter stok saat ini.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          title="Insight Inventaris"
          description="Panel ini merangkum sinyal utama agar admin bisa menentukan restock tanpa membaca seluruh tabel dulu."
          action={<SoftButton>{report.stats.coverageRate}% aman</SoftButton>}
        >
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              <MiniInfo label="Produk Aman" value={String(report.stats.safeCount)} />
              <MiniInfo
                label="Nilai Tertinggi"
                value={report.insights.highestValueProduct?.name ?? "Belum ada"}
              />
              <MiniInfo
                label="Stok Paling Rendah"
                value={report.insights.lowestStockProduct?.name ?? "Belum ada"}
              />
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Kesiapan Inventaris
              </p>
              <p className="mt-2 font-semibold text-[var(--foreground)]">
                {report.stats.coverageRate}% produk berada pada zona aman
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Rasio ini memudahkan admin membaca apakah inventaris masih aman untuk operasional harian.
              </p>
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Prioritas Restock
              </p>
              {report.insights.restockPriorities.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {report.insights.restockPriorities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-[18px] bg-[rgba(245,239,223,0.72)] px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          stok {item.stock} • {item.actionLabel}
                        </p>
                      </div>
                      <StatusPill tone="warn">{item.statusLabel}</StatusPill>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Belum ada produk yang masuk zona restock.
                </p>
              )}
            </div>

            <div className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Nilai Inventaris Tertinggi
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {report.insights.highestValueProduct
                  ? `${report.insights.highestValueProduct.name} memegang nilai stok terbesar sebesar ${report.insights.highestValueProduct.stockValueLabel}.`
                  : "Belum ada produk yang bisa dihitung nilai inventarisnya."}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </section>
    </AppShell>
  );
}
