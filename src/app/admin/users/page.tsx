import Link from "next/link";
import { deleteUserAction } from "@/app/actions/user";
import {
  AdminFormModal,
  AdminMetric,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin-ui";
import { UserDeleteButton } from "@/components/user-delete-button";
import { UserForm } from "@/components/user-form";
import {
  AppShell,
  PrimaryButton,
  SoftButton,
  StatusPill,
  SurfaceCard,
} from "@/components/veggie-ui";
import { requireRole } from "@/lib/auth/session";
import { formatDateLabel } from "@/lib/format";
import { adminNavigation } from "@/lib/navigation";
import {
  formatRoleLabel,
  getRoleTone,
  getUserById,
  getUsers,
  getUserStats,
} from "@/lib/users";

type UsersPageProps = {
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
    message: "User baru berhasil disimpan.",
  },
  updated: {
    tone: "good",
    message: "Perubahan user berhasil disimpan.",
  },
  deleted: {
    tone: "good",
    message: "User berhasil dihapus.",
  },
  protected: {
    tone: "warn",
    message:
      "Aksi diblokir. Akun aktif Anda sendiri atau admin terakhir tidak boleh dihapus.",
  },
  "delete-error": {
    tone: "warn",
    message:
      "User tidak bisa dihapus. Pastikan akun belum dipakai di transaksi atau coba lagi.",
  },
};

function buildEditHref(userId: number, query: string) {
  const search = new URLSearchParams();
  search.set("edit", String(userId));

  if (query.trim()) {
    search.set("q", query.trim());
  }

  return `/admin/users?${search.toString()}`;
}

function buildCreateHref(query: string) {
  const search = new URLSearchParams();
  search.set("new", "1");

  if (query.trim()) {
    search.set("q", query.trim());
  }

  return `/admin/users?${search.toString()}`;
}

function buildAccessNote(totalUsers: number, adminCount: number, cashierCount: number) {
  if (totalUsers <= 0) {
    return "Belum ada akun tersimpan. Tambahkan admin atau kasir pertama lewat tombol tambah di atas.";
  }

  return `${adminCount} admin dan ${cashierCount} kasir siap dipakai untuk operasional harian.`;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const session = await requireRole("ADMIN");
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const status = resolvedSearchParams?.status ?? "idle";
  const isCreateMode = resolvedSearchParams?.new === "1";
  const editId = Number(resolvedSearchParams?.edit);
  const feedback = resolvedSearchParams?.status
    ? statusMessageMap[resolvedSearchParams.status]
    : undefined;

  const [users, filteredStats, overallStats, editingUser] = await Promise.all([
    getUsers(query),
    getUserStats(query),
    getUserStats(),
    Number.isInteger(editId) && editId > 0 ? getUserById(editId) : Promise.resolve(null),
  ]);

  const activeEditUser =
    editingUser && users.some((user) => user.id === editingUser.id) ? editingUser : null;
  const isModalOpen = Boolean(activeEditUser) || isCreateMode;
  const userFormKey = `${activeEditUser?.id ?? "create"}:${query}:${status}`;
  const closeModalHref = query
    ? `/admin/users?q=${encodeURIComponent(query)}`
    : "/admin/users";
  const createHref = buildCreateHref(query);

  return (
    <AppShell
      role="Admin"
      subtitle="Panel pengelolaan akun admin dan kasir."
      noteTitle="Ringkasan Akses"
      noteText={buildAccessNote(
        overallStats.totalUsers,
        overallStats.adminCount,
        overallStats.cashierCount,
      )}
      navigation={adminNavigation}
      currentPath="/admin/users"
    >
      <AdminPageHeader
        eyebrow="Admin • Data User"
        title="Manajemen Pengguna"
        description="Atur akun admin dan kasir dari satu halaman. Modul ini menjaga username tetap unik, password tersimpan aman, dan akun penting tetap terlindungi."
        meta={[
          `${overallStats.adminCount} admin`,
          `${overallStats.cashierCount} kasir`,
          `Hari ini • ${formatDateLabel(new Date())}`,
        ]}
        action={
          <div className="rounded-[22px] border border-[var(--line)] bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Akses Aktif
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {buildAccessNote(
                overallStats.totalUsers,
                overallStats.adminCount,
                overallStats.cashierCount,
              )}
            </p>
          </div>
        }
      />

      <AdminToolbar
        actions={
          <>
            <Link href={createHref}>
              <PrimaryButton>+ Tambah User</PrimaryButton>
            </Link>
            <SoftButton>
              {filteredStats.totalUsers} user {query ? "hasil filter" : "terdaftar"}
            </SoftButton>
          </>
        }
      >
        <form method="get" className="flex flex-1 gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari username, nama lengkap, atau ketik admin/kasir..."
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
              href="/admin/users"
              className="rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
            >
              Reset
            </Link>
          ) : null}
        </form>
      </AdminToolbar>

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminMetric
          label={query ? "Hasil Filter" : "Total User"}
          value={String(filteredStats.totalUsers)}
          note="Jumlah akun yang muncul pada daftar saat ini."
          tone="neutral"
        />
        <AdminMetric
          label={query ? "Admin Hasil" : "Admin"}
          value={String(filteredStats.adminCount)}
          note="Akun dengan akses penuh untuk panel pengelolaan."
          tone="good"
        />
        <AdminMetric
          label={query ? "Kasir Hasil" : "Kasir"}
          value={String(filteredStats.cashierCount)}
          note="Akun operasional yang dipakai untuk transaksi harian."
          tone="neutral"
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
          title="Daftar Pengguna"
          description={
            query
              ? `Menampilkan hasil pencarian untuk "${query}".`
              : "Semua akun di bawah ini ditarik langsung dari database."
          }
          action={<SoftButton>Kontrol Akses</SoftButton>}
        >
          {users.length > 0 ? (
            <div className="grid gap-3">
              {users.map((user) => {
                const isCurrentUser = user.id === session.userId;

                return (
                  <div
                    key={user.id}
                    className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/80 p-4 text-sm md:grid-cols-[1.1fr_1fr_0.75fr_1fr]"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {user.username}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{user.fullName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={getRoleTone(user.role)}>
                        {formatRoleLabel(user.role)}
                      </StatusPill>
                      {isCurrentUser ? <StatusPill tone="soft">Anda</StatusPill> : null}
                    </div>
                    <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      ID User #{user.id}
                    </span>
                    <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                      <Link
                        href={buildEditHref(user.id, query)}
                        className="rounded-full bg-[rgba(97,122,52,0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]"
                      >
                        Edit
                      </Link>
                      {isCurrentUser ? (
                        <StatusPill tone="soft">Akun Aktif</StatusPill>
                      ) : (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="returnQuery" value={query} />
                          <UserDeleteButton />
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
                Belum ada data user.
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Tambahkan akun pertama lewat tombol tambah di atas. Kalau sedang
                mencari, coba ubah kata kunci pencariannya.
              </p>
            </div>
          )}
        </SurfaceCard>
      </section>

      {isModalOpen ? (
        <AdminFormModal
          title={activeEditUser ? "Edit User" : "Tambah User"}
          description={
            activeEditUser
              ? `Anda sedang mengedit akun "${activeEditUser.username}".`
              : "Isi data user baru lalu simpan. Username tetap dicek unik, password akan di-hash, dan role dapat diatur sesuai kebutuhan."
          }
          closeHref={closeModalHref}
        >
          <UserForm
            key={userFormKey}
            user={
              activeEditUser
                ? {
                    id: activeEditUser.id,
                    username: activeEditUser.username,
                    fullName: activeEditUser.fullName,
                    role: activeEditUser.role,
                  }
                : null
            }
            searchQuery={query}
            lockRole={activeEditUser?.id === session.userId}
          />
        </AdminFormModal>
      ) : null}
    </AppShell>
  );
}
