"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";

export type ProductActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"name" | "price" | "stock", string>>;
};

function integerField(
  fieldLabel: string,
  minimum: number,
  minimumMessage: string,
) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        return trimmedValue ? Number(trimmedValue) : undefined;
      }

      return value;
    },
    z
      .number({
        error: `${fieldLabel} harus berupa angka.`,
      })
      .int(`${fieldLabel} harus bilangan bulat.`)
      .min(minimum, minimumMessage),
  );
}

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama sayur minimal 2 karakter.")
    .max(100, "Nama sayur terlalu panjang."),
  price: integerField("Harga", 1, "Harga minimal 1."),
  stock: integerField("Stok", 0, "Stok tidak boleh negatif."),
});

function redirectToProducts(status: string, query?: string): never {
  const searchParams = new URLSearchParams();

  searchParams.set("status", status);

  if (query?.trim()) {
    searchParams.set("q", query.trim());
  }

  redirect(`/admin/produk?${searchParams.toString()}`);
}

function revalidateProductViews() {
  revalidatePath("/admin/produk");
  revalidatePath("/admin/dashboard");
  revalidatePath("/kasir/dashboard");
  revalidatePath("/kasir/transaksi");
}

async function ensureUniqueProductName(name: string, ignoreId?: number) {
  const db = getDb();

  const existingProduct = await db.product.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
  });

  return !existingProduct;
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const query = String(formData.get("returnQuery") ?? "");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Periksa kembali input produk Anda.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        price: fieldErrors.price?.[0],
        stock: fieldErrors.stock?.[0],
      },
    };
  }

  const isUnique = await ensureUniqueProductName(parsed.data.name);

  if (!isUnique) {
    return {
      success: false,
      message: "Nama sayur sudah ada. Gunakan nama lain atau edit data yang ada.",
      fieldErrors: {
        name: "Nama sayur sudah digunakan.",
      },
    };
  }

  const db = getDb();

  try {
    await db.product.create({
      data: parsed.data,
    });
  } catch {
    return {
      success: false,
      message: "Produk gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidateProductViews();
  redirectToProducts("created", query);
}

export async function updateProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const query = String(formData.get("returnQuery") ?? "");
  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      success: false,
      message: "Produk yang ingin diedit tidak valid.",
    };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Periksa kembali input produk Anda.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        price: fieldErrors.price?.[0],
        stock: fieldErrors.stock?.[0],
      },
    };
  }

  const isUnique = await ensureUniqueProductName(parsed.data.name, productId);

  if (!isUnique) {
    return {
      success: false,
      message: "Nama sayur sudah ada. Gunakan nama lain atau edit data yang ada.",
      fieldErrors: {
        name: "Nama sayur sudah digunakan.",
      },
    };
  }

  const db = getDb();

  try {
    await db.product.update({
      where: { id: productId },
      data: parsed.data,
    });
  } catch {
    return {
      success: false,
      message: "Produk gagal diperbarui. Pastikan datanya masih tersedia.",
    };
  }

  revalidateProductViews();
  redirectToProducts("updated", query);
}

export async function deleteProductAction(formData: FormData) {
  const query = String(formData.get("returnQuery") ?? "");
  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    redirectToProducts("delete-error", query);
  }

  const db = getDb();

  try {
    await db.product.delete({
      where: { id: productId },
    });
  } catch {
    redirectToProducts("delete-error", query);
  }

  revalidateProductViews();
  redirectToProducts("deleted", query);
}
