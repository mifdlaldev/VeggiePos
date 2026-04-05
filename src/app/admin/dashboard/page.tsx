import Link from "next/link";
import { AdminMetric, AdminPageHeader } from "@/components/admin-ui";
import { AppShell, SoftButton, StatusPill, SurfaceCard } from "@/components/veggie-ui";
import { formatDateLabel, formatRupiah } from "@/lib/format";
import { adminNavigation } from "@/lib/navigation";
import {
  getProductsNeedingAttention,
  getProductStats,
  getStockStatus,
} from "@/lib/products";

function buildStockNote(lowStockCount: number) {
  if (lowStockCount <= 0) {
    return "Semua produk masih dalam kondisi aman dan siap dipantau dari modul inventaris.";
  }

  return `${lowStockCount} produk perlu restock agar meja kasir tetap aman sepanjang shift.`;
}

export default async function AdminDashboardPage() {
  const [stats, attentionProducts] = await Promise.all([
    getProductStats(),
    getProductsNeedingAttention(),
  ]);

  return (
    <AppShell
      role="Admin"
      subtitle="Panel kontrol toko sayur harian."
      noteTitle="Stok Kritis"
      noteText={buildStockNote(stats.lowStockCount)}
      navigation={adminNavigation}
      currentPath="/admin/dashboard"
    >
      <AdminPageHeader
        eyebrow="Admin • Dashboard"
        title="Ringkasan Operasional Toko"
        description="Halaman ini merangkum kondisi inventaris yang sedang berjalan, menampilkan daftar produk yang perlu perhatian, dan memberi jalur cepat ke modul admin yang paling sering dipakai."
        meta={[
          `Hari ini • ${formatDateLabel(new Date())}`,
          `${stats.totalProducts} produk aktif`,
          `${stats.lowStockCount} stok rendah`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Catatan Hari Ini
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {buildStockNote(stats.lowStockCount)}
            </p>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Total Produk"
          value={String(stats.totalProducts)}
          note="Jumlah produk yang tercatat aktif di inventaris."
          tone="good"
        />
        <AdminMetric
          label="Stok Menipis"
          value={String(stats.lowStockCount)}
          note="Produk yang perlu dipantau atau segera ditambah stoknya."
          tone="warn"
        />
        <AdminMetric
          label="Nilai Inventaris"
          value={formatRupiah(stats.inventoryValue)}
          note="Akumulasi nilai stok berdasarkan harga dan jumlah saat ini."
          tone="neutral"
        />
        <AdminMetric
          label="Produk Dipantau"
          value={String(attentionProducts.length)}
          note="Baris prioritas yang muncul pada daftar perhatian."
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.18fr_0.98fr]">
        <SurfaceCard
          title="Produk yang Perlu Perhatian"
          description="Daftar ini disusun dari stok terendah agar admin bisa menentukan restock lebih cepat."
          action={
            <Link href="/admin/produk">
              <SoftButton>Buka Data Sayuran</SoftButton>
            </Link>
          }
        >
          {attentionProducts.length > 0 ? (
            <div className="grid gap-3">
              {attentionProducts.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <div
                    key={product.id}
                    className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]"
                  >
                    <span className="font-semibold text-[var(--foreground)]">
                      {product.name}
                    </span>
                    <span className="text-[var(--muted)]">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-[var(--muted)]">{product.stock}</span>
                    <StatusPill tone={stock.tone}>{stock.label}</StatusPill>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/72 p-6 text-sm leading-7 text-[var(--muted)]">
              Belum ada produk yang tercatat. Tambahkan produk pertama dari modul data
              sayuran agar dashboard mulai menampilkan prioritas stok.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          title="Jalur Cepat Admin"
          description="Tiga modul utama yang paling sering dipakai untuk kerja harian admin."
        >
          <div className="grid gap-3">
            <Link
              href="/admin/produk"
              className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4 transition hover:border-[rgba(97,122,52,0.22)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Inventaris
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Kelola Data Sayuran
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Tambah, ubah, dan cek stok produk dari satu halaman.
              </p>
            </Link>
            <Link
              href="/admin/users"
              className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4 transition hover:border-[rgba(97,122,52,0.22)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Akses Pengguna
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Kelola Akun Admin & Kasir
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Atur user baru, edit akun, dan jaga struktur akses tetap rapi.
              </p>
            </Link>
            <Link
              href="/admin/laporan/penjualan"
              className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4 transition hover:border-[rgba(97,122,52,0.22)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Laporan
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Tinjau Penjualan Harian
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Lihat transaksi, omzet, dan performa kasir pada periode aktif.
              </p>
            </Link>
          </div>
        </SurfaceCard>
      </section>
    </AppShell>
  );
}
