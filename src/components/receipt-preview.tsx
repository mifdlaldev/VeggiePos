import { formatRupiah } from "@/lib/format";
import type { TransactionReceipt } from "@/lib/transactions";

export function ReceiptPreview({
  receipt,
  draft = false,
}: {
  receipt: TransactionReceipt;
  draft?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-[#fcfaf4] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-[family-name:var(--font-display)] text-3xl">VeggiePOS</h4>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {draft ? "Preview transaksi belum disimpan" : `Nota ${receipt.code}`}
          </p>
        </div>
        <div className="text-right text-sm text-[var(--muted)]">
          <p>{receipt.dateLabel}</p>
          <p>{receipt.timeLabel}</p>
          <p className="mt-2 font-semibold text-[var(--foreground)]">{receipt.cashierName}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {receipt.items.map((item) => (
          <div
            key={`${receipt.id}-${item.productId}`}
            className="flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {item.productName}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {item.quantity} x {formatRupiah(item.unitPrice)}
              </p>
            </div>
            <span className="font-semibold text-[var(--foreground)]">
              {formatRupiah(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Total</span>
          <strong>{formatRupiah(receipt.totalAmount)}</strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Bayar</span>
          <strong>{formatRupiah(receipt.paidAmount)}</strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Kembalian</span>
          <strong>{formatRupiah(receipt.changeAmount)}</strong>
        </div>
      </div>
    </div>
  );
}
