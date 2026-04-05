import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { StatusPill } from "@/components/veggie-ui";
import { getDashboardPath, getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(getDashboardPath(session.role));
  }

  return (
    <main className="min-h-screen px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grain-overlay relative overflow-hidden rounded-[38px] border border-white/40 bg-[linear-gradient(135deg,#244e38_0%,#122b1f_100%)] p-8 text-[#eef6ea] shadow-[var(--shadow-lg)]">
          <div className="inline-flex rounded-full bg-white/8 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d7e8ca]">
            VeggiePOS • Penjualan Sayuran
          </div>

          <h1 className="mt-6 max-w-[10ch] font-[family-name:var(--font-display)] text-5xl leading-[0.92] tracking-tight md:text-7xl">
            VeggiePOS
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/78">
            Sistem kerja harian untuk admin dan kasir dalam mengelola stok,
            transaksi, dan laporan toko sayur dengan alur yang ringkas dan jelas.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <StatusPill tone="good">Admin</StatusPill>
            <StatusPill tone="soft">Kasir</StatusPill>
            <StatusPill tone="warn">Laporan Harian</StatusPill>
          </div>

          <div className="mt-10 max-w-xl rounded-[26px] border border-white/10 bg-white/6 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/58">
              Akses Sistem
            </p>
            <p className="mt-3 text-base leading-8 text-white/78">
              Masuk menggunakan akun yang sudah dibuat oleh admin. Setelah login,
              sistem akan langsung mengarahkan Anda ke area kerja sesuai peran.
            </p>
          </div>

          <div className="absolute bottom-10 right-10 hidden h-56 w-56 lg:block">
            <div className="absolute right-18 top-8 h-18 w-30 rotate-[-22deg] rounded-full bg-[linear-gradient(180deg,#9ec24d_0%,#648833_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.16)]" />
            <div className="absolute right-0 top-18 h-20 w-32 rotate-[28deg] rounded-full bg-[linear-gradient(180deg,#9ec24d_0%,#648833_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.16)]" />
            <div className="absolute bottom-12 left-3 h-22 w-22 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffbb8f_0%,#d76e37_46%,#ae5228_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.16)]" />
            <div className="absolute bottom-0 right-6 h-34 w-14 rotate-[24deg] rounded-full bg-[linear-gradient(180deg,#ffb259_0%,#cf6928_100%)] shadow-[0_18px_35px_rgba(0,0,0,0.16)]" />
          </div>
        </section>

        <section className="rounded-[38px] border border-white/40 bg-[rgba(255,251,244,0.82)] p-8 shadow-[var(--shadow-lg)]">
          <div className="inline-flex rounded-full bg-[rgba(97,122,52,0.1)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--olive-deep)]">
            Login
          </div>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl leading-[0.94] tracking-tight md:text-6xl">
            Selamat datang kembali.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-8 text-[var(--muted)]">
            Masukkan username dan password untuk masuk ke sistem. Halaman ini
            khusus untuk pengguna internal VeggiePOS.
          </p>

          <LoginForm />

          <div className="mt-6 rounded-[22px] bg-[rgba(216,233,203,0.45)] p-4 text-sm leading-7 text-[var(--olive-deep)]">
            Jika Anda lupa akun login atau tidak bisa masuk, hubungi admin toko
            untuk reset data pengguna.
          </div>
        </section>
      </div>
    </main>
  );
}
