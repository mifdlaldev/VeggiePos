"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProductAction,
  type ProductActionState,
  updateProductAction,
} from "@/app/actions/product";
import type { ProductFormValues } from "@/lib/products";

type ProductFormProps = {
  product?: ProductFormValues | null;
  searchQuery: string;
};

const initialState: ProductActionState = {};

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,51,34,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan Data"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-3 text-sm text-[var(--danger)]">{message}</p>;
}

export function ProductForm({ product, searchQuery }: ProductFormProps) {
  const isEditMode = Boolean(product);
  const action = isEditMode ? updateProductAction : createProductAction;
  const [state, formAction] = useActionState(action, initialState);

  const resetHref = searchQuery
    ? `/admin/produk?q=${encodeURIComponent(searchQuery)}`
    : "/admin/produk";

  return (
    <form action={formAction} className="space-y-4">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}
      <input type="hidden" name="returnQuery" value={searchQuery} />

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Nama Sayur
        </span>
        <input
          name="name"
          type="text"
          required
          defaultValue={product?.name ?? ""}
          placeholder="Contoh: Sawi Hijau"
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.name} />
      </label>

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Harga
        </span>
        <input
          name="price"
          type="number"
          min={1}
          step={1}
          required
          defaultValue={product?.price ?? ""}
          placeholder="Contoh: 5000"
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.price} />
      </label>

      <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
          Stok
        </span>
        <input
          name="stock"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={product?.stock ?? ""}
          placeholder="Contoh: 18"
          className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
        />
        <FieldError message={state.fieldErrors?.stock} />
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
