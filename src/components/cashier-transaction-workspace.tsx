"use client";

import { useActionState, useDeferredValue, useState } from "react";
import { createTransactionAction, type TransactionActionState } from "@/app/actions/transaction";
import { CashierMetric, CashierToolbar } from "@/components/cashier-ui";
import { ReceiptPreview } from "@/components/receipt-preview";
import { StatusPill, SurfaceCard } from "@/components/veggie-ui";
import { formatRupiah } from "@/lib/format";
import type { TransactionReceipt } from "@/lib/transactions";

type ProductTone = "good" | "warn";

type CashierProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  statusLabel: string;
  statusTone: ProductTone;
};

type CartItem = {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

type StockFilter = "SEMUA" | "AMAN" | "RENDAH" | "HABIS";

type CashierTransactionWorkspaceProps = {
  cashierName: string;
  products: CashierProduct[];
  todayTransactionCount: number;
  todaySalesTotal: number;
  availableProductsCount: number;
  latestReceipt: TransactionReceipt | null;
};

const initialState: TransactionActionState = {};

function productMatchesFilter(product: CashierProduct, filter: StockFilter) {
  if (filter === "AMAN") {
    return product.stock > 10;
  }

  if (filter === "RENDAH") {
    return product.stock > 0 && product.stock <= 10;
  }

  if (filter === "HABIS") {
    return product.stock <= 0;
  }

  return true;
}

function buildDraftReceipt(
  cashierName: string,
  cart: CartItem[],
  paidAmount: number,
): TransactionReceipt {
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    id: 0,
    code: "DRAFT",
    cashierName,
    cashierUsername: "",
    dateLabel: "Belum disimpan",
    timeLabel: "Live",
    totalAmount,
    paidAmount,
    changeAmount: Math.max(paidAmount - totalAmount, 0),
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    items: cart.map((item) => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
    })),
  };
}

export function CashierTransactionWorkspace({
  cashierName,
  products,
  todayTransactionCount,
  todaySalesTotal,
  availableProductsCount,
  latestReceipt,
}: CashierTransactionWorkspaceProps) {
  const [state, formAction] = useActionState(createTransactionAction, initialState);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("SEMUA");
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalizedSearchTerm
      ? product.name.toLowerCase().includes(normalizedSearchTerm)
      : true;

    return matchesSearch && productMatchesFilter(product, stockFilter);
  });

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const paidAmount = Number(paidAmountInput || 0);
  const liveChangeAmount = Math.max(paidAmount - cartTotalAmount, 0);
  const previewReceipt =
    cart.length > 0 ? buildDraftReceipt(cashierName, cart, paidAmount) : latestReceipt;

  function addProductToCart(product: CashierProduct) {
    setLocalMessage(null);

    if (product.stock <= 0) {
      setLocalMessage(`${product.name} sedang habis dan belum bisa dimasukkan ke keranjang.`);
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === product.id);

      if (existingItem && existingItem.quantity >= product.stock) {
        setLocalMessage(`Qty ${product.name} sudah mencapai stok tersedia.`);
        return currentCart;
      }

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }

  function incrementQuantity(productId: number) {
    setLocalMessage(null);

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (item.quantity >= item.stock) {
          setLocalMessage(`Qty ${item.name} tidak boleh melebihi stok yang tersedia.`);
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      }),
    );
  }

  function decrementQuantity(productId: number) {
    setLocalMessage(null);

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId: number) {
    setLocalMessage(null);
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  }

  function resetCart() {
    setLocalMessage(null);
    setPaidAmountInput("");
    setCart([]);
  }

  return (
    <>
      <CashierToolbar
        actions={
          <>
            <span className="inline-flex items-center rounded-[16px] bg-[rgba(97,122,52,0.12)] px-4 py-3 text-sm font-semibold text-[var(--olive-deep)]">
              {cashierName}
            </span>
            <span className="inline-flex items-center rounded-[16px] bg-[rgba(97,122,52,0.12)] px-4 py-3 text-sm font-semibold text-[var(--olive-deep)]">
              {latestReceipt ? `Nota ${latestReceipt.code}` : "Belum ada nota"}
            </span>
          </>
        }
      >
        <div className="flex flex-col gap-3 xl:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari barang / lihat harga sayur..."
            className="min-h-13 flex-1 rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
          />
          <div className="flex flex-wrap gap-2">
            {(["SEMUA", "AMAN", "RENDAH", "HABIS"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStockFilter(filter)}
                className={`rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  stockFilter === filter
                    ? "border-[var(--line)] bg-[rgba(216,233,203,0.55)] text-[var(--olive-deep)]"
                    : "border-[var(--line)] bg-white/75 text-[var(--muted)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </CashierToolbar>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CashierMetric
          label="Transaksi Hari Ini"
          value={String(todayTransactionCount)}
          note="Nota berhasil yang tersimpan hari ini."
          tone="good"
        />
        <CashierMetric
          label="Penjualan Hari Ini"
          value={formatRupiah(todaySalesTotal)}
          note="Akumulasi nominal transaksi yang sudah selesai."
          tone="neutral"
        />
        <CashierMetric
          label="Nilai Keranjang"
          value={formatRupiah(cartTotalAmount)}
          note={
            cartItemCount > 0
              ? `${cartItemCount} item aktif di keranjang.`
              : "Keranjang masih kosong."
          }
          tone={cartItemCount > 0 ? "good" : "neutral"}
        />
        <CashierMetric
          label="Produk Siap Scan"
          value={String(availableProductsCount)}
          note="Jumlah produk yang stoknya masih tersedia untuk dijual."
          tone="good"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.95fr]">
        <SurfaceCard
          title="Daftar Produk"
          description="Klik produk untuk memasukkannya ke keranjang. Filter stok membantu kasir melihat item yang aman, rendah, atau habis."
          action={<StatusPill tone="soft">{filteredProducts.length} produk tampil</StatusPill>}
        >
          {products.length > 0 ? (
            filteredProducts.length > 0 ? (
              <div className="grid gap-3">
                {filteredProducts.map((product) => {
                  const cartQuantity =
                    cart.find((item) => item.productId === product.id)?.quantity ?? 0;
                  const stockReached = cartQuantity >= product.stock && product.stock > 0;

                  return (
                    <article
                      key={product.id}
                      className="grid gap-3 rounded-[18px] border border-[var(--line)] bg-white/84 p-4 md:grid-cols-[1.25fr_0.85fr_0.85fr_0.8fr_0.9fr]"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Harga {formatRupiah(product.price)}
                        </p>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        <p className="font-semibold text-[var(--foreground)]">{product.stock}</p>
                        <p>stok tersedia</p>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        <p className="font-semibold text-[var(--foreground)]">{cartQuantity}</p>
                        <p>di keranjang</p>
                      </div>
                      <div className="flex items-center">
                        <StatusPill tone={product.statusTone}>{product.statusLabel}</StatusPill>
                      </div>
                      <div className="flex items-center justify-start md:justify-end">
                        <button
                          type="button"
                          disabled={product.stock <= 0 || stockReached}
                          onClick={() => addProductToCart(product)}
                          className="rounded-[14px] bg-[var(--sidebar)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {product.stock <= 0 ? "Habis" : stockReached ? "Penuh" : "+ Keranjang"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
                  <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
                    Produk tidak ditemukan.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Ubah kata kunci pencarian atau pilih filter stok lain.
                  </p>
                </div>
              )
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
                Belum ada produk untuk dijual.
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Admin perlu menambahkan data sayuran lebih dulu sebelum kasir bisa memulai transaksi.
              </p>
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-5">
          <form action={formAction} className="space-y-5">
            <input
              type="hidden"
              name="cart"
              value={JSON.stringify(
                cart.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                })),
              )}
            />
            <input type="hidden" name="paidAmount" value={paidAmountInput} />

            <SurfaceCard
              title="Keranjang Aktif"
              description={
                cart.length > 0
                  ? `${cartItemCount} item aktif di nota ini.`
                  : "Keranjang masih kosong. Tambahkan produk dari sisi kiri."
              }
              action={
                <StatusPill tone={cart.length > 0 ? "warn" : "soft"}>
                  {cart.length > 0 ? `${cartItemCount} item` : "kosong"}
                </StatusPill>
              }
            >
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-[18px] border border-[var(--line)] bg-white/78 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatRupiah(item.price)} • stok {item.stock}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(item.productId)}
                            className="h-9 w-9 rounded-full border border-[var(--line)] bg-white text-lg"
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQuantity(item.productId)}
                            className="h-9 w-9 rounded-full border border-[var(--line)] bg-white text-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="rounded-full bg-[rgba(181,72,66,0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--danger)]"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-sm leading-7 text-[var(--muted)]">
                  Produk yang dipilih akan muncul di sini. Kasir bisa mengubah qty sebelum transaksi disimpan.
                </div>
              )}

              {state.fieldErrors?.cart ? (
                <p className="mt-4 text-sm text-[var(--danger)]">{state.fieldErrors.cart}</p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
                <span className="text-sm text-[var(--muted)]">Total Belanja</span>
                <strong className="font-[family-name:var(--font-display)] text-4xl">
                  {formatRupiah(cartTotalAmount)}
                </strong>
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Pembayaran"
              description="Sistem menghitung kembalian secara live, lalu server akan memvalidasi lagi saat transaksi disimpan."
              action={<StatusPill tone="soft">Tunai</StatusPill>}
            >
              <div className="space-y-4">
                <label className="block rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
                    Uang Bayar
                  </span>
                  <input
                    name="paidAmountVisible"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={paidAmountInput}
                    onChange={(event) => setPaidAmountInput(event.target.value)}
                    placeholder="Contoh: 50000"
                    className="mt-3 w-full border-none bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
                  />
                  {state.fieldErrors?.paidAmount ? (
                    <p className="mt-3 text-sm text-[var(--danger)]">
                      {state.fieldErrors.paidAmount}
                    </p>
                  ) : null}
                </label>

                <div className="rounded-[22px] border border-[var(--line)] bg-white/78 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]">
                    Kembalian
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">
                    {formatRupiah(liveChangeAmount)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {paidAmount >= cartTotalAmount && cartTotalAmount > 0
                      ? "Pembayaran cukup untuk menyimpan transaksi."
                      : "Masukkan uang bayar minimal sama dengan total belanja."}
                  </p>
                </div>
              </div>

              {state.message ? (
                <div className="mt-5 rounded-[22px] bg-[rgba(181,72,66,0.12)] p-4 text-sm leading-7 text-[var(--danger)]">
                  {state.message}
                </div>
              ) : null}

              {localMessage ? (
                <div className="mt-5 rounded-[22px] bg-[rgba(246,219,201,0.45)] p-4 text-sm leading-7 text-[#9f4f27]">
                  {localMessage}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="inline-flex items-center rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,51,34,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={resetCart}
                  className="inline-flex items-center rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]"
                >
                  Reset
                </button>
              </div>
            </SurfaceCard>
          </form>

          {previewReceipt ? (
            <SurfaceCard
              title="Preview Struk"
              description={
                cart.length > 0
                  ? "Preview ini mengikuti isi keranjang aktif sebelum transaksi disimpan."
                  : "Nota terakhir yang berhasil disimpan akan tetap tampil di sini sebagai referensi."
              }
              action={
                <StatusPill tone={cart.length > 0 ? "warn" : "soft"}>
                  {cart.length > 0 ? "Draft Aktif" : previewReceipt.code}
                </StatusPill>
              }
            >
              <ReceiptPreview receipt={previewReceipt} draft={cart.length > 0} />
            </SurfaceCard>
          ) : (
            <SurfaceCard
              title="Preview Struk"
              description="Setelah transaksi pertama tersimpan, struk terakhir akan muncul di sini."
            >
              <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-sm leading-7 text-[var(--muted)]">
                Belum ada nota tersimpan untuk akun kasir ini.
              </div>
            </SurfaceCard>
          )}
        </div>
      </section>
    </>
  );
}
