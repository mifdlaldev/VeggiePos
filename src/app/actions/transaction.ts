"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";

export type TransactionActionState = {
  message?: string;
  fieldErrors?: Partial<Record<"cart" | "paidAmount", string>>;
};

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(999),
});

const checkoutSchema = z.object({
  paidAmount: z.preprocess(
    (value) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : value;
    },
    z.number().int().min(0, "Uang bayar tidak valid."),
  ),
  cart: z.array(cartItemSchema).min(1, "Keranjang masih kosong."),
});

function mergeCartItems(items: Array<z.infer<typeof cartItemSchema>>) {
  const merged = new Map<number, number>();

  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  return [...merged.entries()]
    .map(([productId, quantity]) => ({
      productId,
      quantity,
    }))
    .sort((left, right) => left.productId - right.productId);
}

function parseCartValue(rawCart: FormDataEntryValue | null) {
  if (typeof rawCart !== "string" || !rawCart.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCart);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .map((item) => ({
        productId: Number(item?.productId),
        quantity: Number(item?.quantity),
      }))
      .filter(
        (item) =>
          Number.isInteger(item.productId) &&
          item.productId > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      );
  } catch {
    return null;
  }
}

function redirectToTransactionPage(status: string, transactionId?: number): never {
  const searchParams = new URLSearchParams();
  searchParams.set("status", status);

  if (transactionId) {
    searchParams.set("transactionId", String(transactionId));
  }

  redirect(`/kasir/transaksi?${searchParams.toString()}`);
}

function revalidateTransactionViews() {
  revalidatePath("/kasir/transaksi");
  revalidatePath("/kasir/dashboard");
  revalidatePath("/kasir/riwayat");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/produk");
  revalidatePath("/admin/laporan/penjualan");
  revalidatePath("/admin/laporan/stok");
}

export async function createTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const session = await requireRole("KASIR");
  const parsedCart = parseCartValue(formData.get("cart"));
  const parsed = checkoutSchema.safeParse({
    paidAmount: formData.get("paidAmount"),
    cart: parsedCart,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      message: "Periksa kembali pembayaran dan isi keranjang Anda.",
      fieldErrors: {
        cart: fieldErrors.cart?.[0],
        paidAmount: fieldErrors.paidAmount?.[0],
      },
    };
  }

  const normalizedCart = mergeCartItems(parsed.data.cart);
  const db = getDb();
  const products = await db.product.findMany({
    where: {
      id: {
        in: normalizedCart.map((item) => item.productId),
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
  });

  if (products.length !== normalizedCart.length) {
    return {
      message: "Beberapa produk sudah tidak tersedia. Muat ulang halaman lalu coba lagi.",
      fieldErrors: {
        cart: "Keranjang berisi produk yang sudah tidak ditemukan.",
      },
    };
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const insufficientProducts = normalizedCart
    .map((item) => ({
      item,
      product: productsById.get(item.productId),
    }))
    .filter((entry) => !entry.product || entry.product.stock < entry.item.quantity);

  if (insufficientProducts.length > 0) {
    const productNames = insufficientProducts
      .map((entry) => entry.product?.name)
      .filter(Boolean)
      .join(", ");

    return {
      message: "Stok tidak mencukupi untuk beberapa item di keranjang.",
      fieldErrors: {
        cart: productNames
          ? `Stok ${productNames} tidak cukup. Periksa qty lalu simpan ulang.`
          : "Ada item dengan stok yang tidak cukup.",
      },
    };
  }

  const totalAmount = normalizedCart.reduce((total, item) => {
    const product = productsById.get(item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  if (parsed.data.paidAmount < totalAmount) {
    return {
      message: "Uang bayar masih kurang dari total belanja.",
      fieldErrors: {
        paidAmount: "Uang bayar harus lebih besar atau sama dengan total belanja.",
      },
    };
  }

  try {
    const transaction = await db.$transaction(async (tx) => {
      for (const item of normalizedCart) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count !== 1) {
          throw new Error(`STOCK_CHANGED:${item.productId}`);
        }
      }

      return tx.transaction.create({
        data: {
          userId: session.userId,
          totalAmount,
          paidAmount: parsed.data.paidAmount,
          changeAmount: parsed.data.paidAmount - totalAmount,
          transactionDetails: {
            create: normalizedCart.map((item) => {
              const product = productsById.get(item.productId);

              return {
                productId: item.productId,
                quantity: item.quantity,
                subtotal: (product?.price ?? 0) * item.quantity,
              };
            }),
          },
        },
        select: {
          id: true,
        },
      });
    });

    revalidateTransactionViews();
    redirectToTransactionPage("saved", transaction.id);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("STOCK_CHANGED:")) {
      revalidateTransactionViews();

      return {
        message: "Stok berubah saat transaksi disimpan. Cek ulang jumlah item lalu coba lagi.",
        fieldErrors: {
          cart: "Stok berubah di server. Perbarui keranjang sebelum menyimpan lagi.",
        },
      };
    }

    return {
      message: "Transaksi gagal disimpan. Silakan coba lagi.",
    };
  }
}
