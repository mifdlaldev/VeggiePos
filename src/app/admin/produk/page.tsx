import Link from "next/link";
import { deleteProductAction } from "@/app/actions/product";
import {
  AdminFormModal,
  AdminMetric,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin-ui";
import { ProductDeleteButton } from "@/components/product-delete-button";
import { ProductForm } from "@/components/product-form";
import {
  AppShell,
  PrimaryButton,
  SoftButton,
  SurfaceCard,
  StatusPill,
} from "@/components/veggie-ui";
import { formatDateLabel, formatRupiah } from "@/lib/format";
import { adminNavigation } from "@/lib/navigation";
import {
  getProductById,
  getProducts,
  getProductStats,
  getStockStatus,
} from "@/lib/products";

type ProdukPageProps = {
  searchParams?: Promise<{
    q?: string;
    edit?: string;
    new?: string;
    status?: string;
  }>;
};

const statusMessageMap: Record<string, { tone: "good" | "warn"; message: string }> = {
  created: {
    tone: "good",
    message: "Produk baru berhasil disimpan.",
  },
  updated: {
    tone: "good",
    message: "Perubahan produk berhasil disimpan.",
  },
  deleted: {
    tone: "good",
    message: "Produk berhasil dihapus.",
  },
  "delete-error": {
    tone: "warn",
    message:
      "Produk tidak bisa dihapus. Pastikan produk belum dipakai di transaksi atau coba lagi.",
  },
};

function buildEditHref(productId: number, query: string) {
  const search = new URLSearchParams();
  search.set("edit", String(productId));

  if (query.trim()) {
    search.set("q", query.trim());
  }

  return `/admin/produk?${search.toString()}`;
}

function buildCreateHref(query: string) {
  const search = new URLSearchParams();
  search.set("new", "1");

  if (query.trim()) {
    search.set("q", query.trim());
  }

  return `/admin/produk?${search.toString()}`;
}

export default async function AdminProdukPage({
  searchParams,
}: ProdukPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const status = resolvedSearchParams?.status ?? "idle";
  const isCreateMode = resolvedSearchParams?.new === "1";
  const editId = Number(resolvedSearchParams?.edit);
  const feedback = resolvedSearchParams?.status
    ? statusMessageMap[resolvedSearchParams.status]
    : undefined;

  const [products, stats, editingProduct] = await Promise.all([
    getProducts(query),
    getProductStats(query),
    Number.isInteger(editId) && editId > 0 ? getProductById(editId) : Promise.resolve(null),
  ]);

  const activeEditProduct =
    editingProduct && products.some((product) => product.id === editingProduct.id)
      ? editingProduct
      : null;
  const isModalOpen = Boolean(activeEditProduct) || isCreateMode;
  const productFormKey = `${activeEditProduct?.id ?? "create"}:${query}:${status}`;
  const closeModalHref = query
    ? `/admin/produk?q=${encodeURIComponent(query)}`
    : "/admin/produk";
  const createHref = buildCreateHref(query);

  return (
    <AppShell
      role="Admin"
      subtitle="Inventaris produk sayur dan harga harian."
      navigation={adminNavigation}
      currentPath="/admin/produk"
    >
      <AdminPageHeader
        eyebrow="Admin • Produk"
        title="Data Sayuran"
        description="Kelola produk dari satu halaman: cari, tambah, edit, dan hapus. Semua perubahan akan langsung tersimpan ke database dan memengaruhi modul kasir maupun laporan."
        meta={[
          `${stats.totalProducts} produk tampil`,
          `${stats.lowStockCount} stok rendah`,
          query ? `Filter • ${query}` : `Hari ini • ${formatDateLabel(new Date())}`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Inventaris Aktif
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Produk dengan stok rendah akan muncul lebih dulu agar restock lebih mudah diprioritaskan.
            </p>
          </div>
        }
      />

      <AdminToolbar
        actions={
          <>
            <Link href={createHref}>
              <PrimaryButton>+ Tambah Produk</PrimaryButton>
            </Link>
            <SoftButton>
              {stats.totalProducts} produk {query ? "hasil filter" : "tampil"}
            </SoftButton>
          </>
        }
      >
        <form method="get" className="flex flex-1 gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari nama sayur atau filter stok..."
            className="min-h-13 flex-1 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
          />
          <button
            type="submit"
            className="rounded-[16px] bg-[rgba(97,122,52,0.12)] px-4 py-3 text-sm font-semibold text-[var(--olive-deep)]"
          >
            Cari
          </button>
          {query ? (
            <Link
              href="/admin/produk"
              className="rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
            >
              Reset
            </Link>
          ) : null}
        </form>
      </AdminToolbar>

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminMetric
          label="Produk Tampil"
          value={String(stats.totalProducts)}
          note="Jumlah produk yang muncul pada daftar saat ini."
          tone="neutral"
        />
        <AdminMetric
          label="Nilai Inventaris"
          value={formatRupiah(stats.inventoryValue)}
          note="Total nilai stok dari hasil filter yang sedang aktif."
          tone="good"
        />
        <AdminMetric
          label="Stok Rendah"
          value={String(stats.lowStockCount)}
          note="Produk yang perlu pantauan atau tambahan stok."
          tone="warn"
        />
      </section>

      {feedback ? (
        <div
          className={`rounded-[24px] border p-4 text-sm leading-7 ${
            feedback.tone === "good"
              ? "border-[#d7e8ca] bg-[rgba(216,233,203,0.45)] text-[var(--olive-deep)]"
              : "border-[#f6dbc9] bg-[rgba(246,219,201,0.45)] text-[#9f4f27]"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section>
        <SurfaceCard
          title="Daftar Sayuran"
          description={
            query
              ? `Menampilkan hasil pencarian untuk "${query}".`
              : "Semua produk di bawah ini ditarik langsung dari database."
          }
          action={<SoftButton>Urut stok rendah</SoftButton>}
        >
          {products.length > 0 ? (
            <div className="grid gap-3">
              {products.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <div
                    key={product.id}
                    className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1.3fr_0.9fr_0.7fr_0.8fr_1fr]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                        ID Produk #{product.id}
                      </p>
                    </div>
                    <span className="text-[var(--muted)]">{formatRupiah(product.price)}</span>
                    <span className="text-[var(--muted)]">{product.stock}</span>
                    <StatusPill tone={stock.tone}>{stock.label}</StatusPill>
                    <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                      <Link
                        href={buildEditHref(product.id, query)}
                        className="rounded-full bg-[rgba(97,122,52,0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]"
                      >
                        Edit
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="returnQuery" value={query} />
                        <ProductDeleteButton />
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
                Belum ada data sayuran.
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Tambahkan produk pertama Anda lewat tombol tambah di atas. Kalau
                sedang mencari, coba ubah kata kunci pencariannya.
              </p>
            </div>
          )}
        </SurfaceCard>
      </section>

      {isModalOpen ? (
        <AdminFormModal
          title={activeEditProduct ? "Edit Sayuran" : "Tambah Sayuran"}
          description={
            activeEditProduct
              ? `Anda sedang mengedit produk "${activeEditProduct.name}".`
              : "Isi data produk baru lalu simpan. Validasi nama, harga, dan stok tetap berjalan sebelum data masuk ke database."
          }
          closeHref={closeModalHref}
        >
          <ProductForm
            key={productFormKey}
            product={
              activeEditProduct
                ? {
                    id: activeEditProduct.id,
                    name: activeEditProduct.name,
                    price: activeEditProduct.price,
                    stock: activeEditProduct.stock,
                  }
                : null
            }
            searchQuery={query}
          />
        </AdminFormModal>
      ) : null}
    </AppShell>
  );
}
