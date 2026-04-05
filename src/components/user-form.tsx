"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createUserAction,
  type UserActionState,
  updateUserAction,
} from "@/app/actions/user";
import type { UserFormValues } from "@/lib/users";

type UserFormProps = {
  user?: UserFormValues | null;
  searchQuery: string;
  lockRole: boolean;
};

const initialState: UserActionState = {};

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,51,34,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan User"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-3 text-sm text-[var(--danger)]">{message}</p>;
}

export function UserForm({ user, searchQuery, lockRole }: UserFormProps) {
  const isEditMode = Boolean(user);
  const action = isEditMode ? updateUserAction : createUserAction;
  const [state, formAction] = useActionState(action, initialState);

  const resetHref = searchQuery
    ? `/admin/users?q=${encodeURIComponent(searchQuery)}`
    : "/admin/users";

  return (
    <form action={formAction} className="space-y-4">
      {user ? <input type="hidden" name="userId" value={user.id} /> : null}
      <input type="hidden" name="returnQuery" value={searchQuery} />
      {lockRole && user ? <input type="hidden" name="role" value={user.role} /> : null}

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Username
        </span>
        <input
          name="username"
          type="text"
          required
          defaultValue={user?.username ?? ""}
          placeholder="Contoh: kasir.pagi"
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.username} />
      </label>

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Password
        </span>
        <input
          name="password"
          type="password"
          required={!isEditMode}
          autoComplete="new-password"
          placeholder={
            isEditMode
              ? "Kosongkan jika password tidak diubah"
              : "Minimal 6 karakter"
          }
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.password} />
      </label>

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Nama Lengkap
        </span>
        <input
          name="fullName"
          type="text"
          required
          defaultValue={user?.fullName ?? ""}
          placeholder="Contoh: Nanda Saputra"
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.fullName} />
      </label>

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Level User
        </span>
        <select
          name={lockRole && user ? undefined : "role"}
          defaultValue={user?.role ?? "KASIR"}
          disabled={lockRole}
          className="mt-3 w-full appearance-none border-none bg-transparent text-base text-[var(--foreground)] outline-none disabled:text-[var(--muted)]"
        >
          <option value="ADMIN">Admin</option>
          <option value="KASIR">Kasir</option>
        </select>
        {lockRole ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Role akun yang sedang Anda pakai dikunci untuk mencegah kehilangan akses.
          </p>
        ) : null}
        <FieldError message={state.fieldErrors?.role} />
      </label>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEditMode={isEditMode} />
        <Link
          href={resetHref}
          className="inline-flex items-center rounded-[16px] bg-[rgba(97,122,52,0.12)] px-4 py-3 text-sm font-semibold text-[var(--olive-deep)]"
        >
          {isEditMode ? "Tutup" : "Batal"}
        </Link>
      </div>

      {state.message ? (
        <div className="rounded-[22px] bg-[rgba(181,72,66,0.12)] p-4 text-sm leading-7 text-[var(--danger)]">
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
