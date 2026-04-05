"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { LoginActionState } from "@/app/actions/auth";
import { loginAction } from "@/app/actions/auth";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,51,34,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Memproses..." : "Masuk ke Sistem"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8">
      <div className="space-y-4">
        <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
            Username
          </span>
          <input
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="Masukkan username"
            className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
          />
        </label>

        <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <SubmitButton />
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Gunakan akun sesuai peran Anda. Admin akan diarahkan ke panel pengelolaan,
        sedangkan kasir akan langsung masuk ke area transaksi.
      </p>

      {state.error ? (
        <div className="mt-5 rounded-[22px] bg-[rgba(181,72,66,0.12)] p-4 text-sm leading-7 text-[var(--danger)]">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}
