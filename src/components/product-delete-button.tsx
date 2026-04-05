"use client";

type ProductDeleteButtonProps = {
  label?: string;
};

export function ProductDeleteButton({
  label = "Hapus",
}: ProductDeleteButtonProps) {
  return (
    <button
      type="submit"
      className="rounded-full bg-[rgba(181,72,66,0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--danger)] transition hover:bg-[rgba(181,72,66,0.18)]"
      onClick={(event) => {
        const confirmed = window.confirm(
          "Yakin ingin menghapus produk ini? Aksi ini tidak bisa dibatalkan.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
