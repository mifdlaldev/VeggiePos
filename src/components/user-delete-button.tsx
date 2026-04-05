"use client";

export function UserDeleteButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const isConfirmed = window.confirm(
          "Yakin ingin menghapus user ini? Akses login user akan langsung hilang.",
        );

        if (!isConfirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-full bg-[rgba(181,72,66,0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      Hapus
    </button>
  );
}
