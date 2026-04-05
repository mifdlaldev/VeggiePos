import Link from "next/link";
import { CashierPageHeader, CashierToolbar } from "@/components/cashier-ui";
import { ReceiptPreview } from "@/components/receipt-preview";
import {
  AppShell,
  MiniInfo,
  SoftButton,
  SurfaceCard,
} from "@/components/veggie-ui";
import { requireRole } from "@/lib/auth/session";
import { formatDateLabel, formatRupiah } from "@/lib/format";
import { cashierNavigation } from "@/lib/navigation";
import {
  getCashierHistoryRows,
  getCashierReceiptById,
  getLatestCashierReceipt,
} from "@/lib/transactions";

type CashierHistoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    transactionId?: string;
  }>;
};

export default async function CashierHistoryPage({
  searchParams,
}: CashierHistoryPageProps) {
  const session = await requireRole("KASIR");
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const transactionId = Number(resolvedSearchParams?.transactionId);

  const [historyRows, selectedReceipt, latestReceipt] = await Promise.all([
    getCashierHistoryRows(session.userId, query, 20),
    Number.isInteger(transactionId) && transactionId > 0
      ? getCashierReceiptById(session.userId, transactionId)
      : Promise.resolve(null),
    getLatestCashierReceipt(session.userId),
  ]);

  const activeReceipt =
    selectedReceipt ??
    (historyRows.length > 0
      ? await getCashierReceiptById(session.userId, historyRows[0].id)
      : latestReceipt);

  return (
    <AppShell
      role="Kasir"
      subtitle={`Riwayat nota • ${session.fullName}`}
      noteTitle="Riwayat Singkat"
      noteText="Gunakan halaman ini untuk meninjau transaksi yang sudah tersimpan dan membuka detail nota bila diperlukan."
      navigation={cashierNavigation}
      currentPath="/kasir/riwayat"
    >
      <CashierPageHeader
        eyebrow="Kasir • Riwayat"
        title="Riwayat Nota"
        description="Halaman ini dipakai untuk mencari nota yang sudah tersimpan dan membuka detail transaksi dari akun kasir yang sedang aktif."
        meta={[
          session.fullName,
          `Hari ini • ${formatDateLabel(new Date())}`,
          `${historyRows.length} nota ${query ? "hasil pencarian" : "tersedia"}`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Nota Aktif
            </p>
            <p className="mt-2 font-semibold text-[var(--foreground)]">
              {activeReceipt ? activeReceipt.code : "Belum ada nota dipilih"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Pilih satu baris dari daftar riwayat untuk melihat isi transaksi secara lengkap.
            </p>
          </div>
        }
      />

      <CashierToolbar>
        <form method="get" className="flex flex-1 gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari kode nota, tanggal, atau total transaksi..."
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
              href="/kasir/riwayat"
              className="rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
            >
              Reset
            </Link>
          ) : null}
        </form>
      </CashierToolbar>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.95fr]">
        <SurfaceCard
          title="Daftar Riwayat"
          description={
            query
              ? `Menampilkan hasil pencarian untuk "${query}".`
              : "20 transaksi terakhir dari akun kasir yang sedang aktif."
          }
          action={<SoftButton>{historyRows.length} nota</SoftButton>}
        >
          {historyRows.length > 0 ? (
            <div className="grid gap-3">
              {historyRows.map((row) => (
                <Link
                  key={row.id}
                  href={
                    query
                      ? `/kasir/riwayat?q=${encodeURIComponent(query)}&transactionId=${row.id}`
                      : `/kasir/riwayat?transactionId=${row.id}`
                  }
                  className={`grid gap-3 rounded-[18px] border bg-white/80 p-4 text-sm transition md:grid-cols-[1fr_0.8fr_0.8fr_0.9fr] ${
                    activeReceipt?.id === row.id
                      ? "border-[rgba(97,122,52,0.3)] bg-[rgba(216,233,203,0.28)]"
                      : "border-[var(--line)] hover:border-[rgba(97,122,52,0.2)]"
                  }`}
                >
                  <span className="font-semibold">{row.code}</span>
                  <span className="text-[var(--muted)]">{row.dateLabel}</span>
                  <span className="text-[var(--muted)]">{row.timeLabel}</span>
                  <span className="font-semibold">{row.totalLabel}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-sm leading-7 text-[var(--muted)]">
              Belum ada transaksi yang cocok dengan pencarian ini.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          title="Detail Nota"
          description={
            activeReceipt
              ? `Detail untuk ${activeReceipt.code}.`
              : "Pilih salah satu nota di kiri untuk melihat detailnya."
          }
        >
          {activeReceipt ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <MiniInfo label="Kode Nota" value={activeReceipt.code} />
                <MiniInfo label="Total Item" value={String(activeReceipt.itemCount)} />
                <MiniInfo label="Kembalian" value={formatRupiah(activeReceipt.changeAmount)} />
              </div>
              <ReceiptPreview receipt={activeReceipt} />
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-sm leading-7 text-[var(--muted)]">
              Belum ada detail nota yang bisa ditampilkan.
            </div>
          )}
        </SurfaceCard>
      </section>
    </AppShell>
  );
}
