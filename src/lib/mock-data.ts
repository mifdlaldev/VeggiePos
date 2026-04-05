export const dashboardStats = [
  { label: "Total Produk", value: "128", tone: "good" as const, badge: "aktif" },
  { label: "Stok Menipis", value: "12", tone: "warn" as const, badge: "warning" },
  { label: "User Aktif", value: "7", tone: "soft" as const, badge: "tim" },
  { label: "Penjualan Hari Ini", value: "Rp2.4jt", tone: "good" as const, badge: "naik 8%" },
];

export const productRows = [
  { name: "Sawi Hijau", price: "Rp5.000", stock: "22 ikat", status: "aman" },
  { name: "Kangkung", price: "Rp4.500", stock: "6 ikat", status: "rendah" },
  { name: "Cabai Rawit", price: "Rp32.000", stock: "11 kg", status: "aman" },
  { name: "Timun", price: "Rp8.000", stock: "18 kg", status: "aman" },
];

export const userRows = [
  { username: "admin.utama", role: "Admin", status: "aktif" },
  { username: "kasir.pagi", role: "Kasir", status: "aktif" },
  { username: "kasir.siang", role: "Kasir", status: "aktif" },
  { username: "kasir.cadangan", role: "Kasir", status: "nonaktif" },
];

export const salesRows = [
  { code: "#TRX-2403", cashier: "Nanda", time: "07:18", total: "Rp37.500" },
  { code: "#TRX-2404", cashier: "Dina", time: "07:34", total: "Rp62.000" },
  { code: "#TRX-2405", cashier: "Nanda", time: "08:06", total: "Rp44.500" },
  { code: "#TRX-2406", cashier: "Rian", time: "08:42", total: "Rp55.000" },
];

export const stockRows = [
  { name: "Bayam Hijau", stock: "4 ikat", minimum: "12 ikat", status: "restock" },
  { name: "Kangkung", stock: "6 ikat", minimum: "10 ikat", status: "rendah" },
  { name: "Tomat Merah", stock: "7 kg", minimum: "14 kg", status: "restock" },
  { name: "Wortel", stock: "16 kg", minimum: "8 kg", status: "aman" },
];

export const cashierStats = [
  { label: "Transaksi Hari Ini", value: "18", tone: "good" as const, badge: "aktif" },
  { label: "Nilai Keranjang", value: "Rp37.500", tone: "soft" as const, badge: "live" },
  { label: "Produk Siap Scan", value: "128", tone: "good" as const, badge: "stok" },
];

export const cashierProducts = [
  { name: "Bayam", price: "Rp6.000 / ikat", stock: "18", status: "aman" },
  { name: "Tomat", price: "Rp9.500 / kg", stock: "7", status: "rendah" },
  { name: "Wortel", price: "Rp14.000 / kg", stock: "16", status: "aman" },
  { name: "Kangkung", price: "Rp4.500 / ikat", stock: "6", status: "rendah" },
  { name: "Cabai Rawit", price: "Rp32.000 / kg", stock: "11", status: "aman" },
  { name: "Timun", price: "Rp8.000 / kg", stock: "18", status: "aman" },
];

export const cartRows = [
  { name: "Bayam", info: "2 x Rp6.000", total: "Rp12.000" },
  { name: "Tomat", info: "1 x Rp9.500", total: "Rp9.500" },
  { name: "Timun", info: "2 x Rp8.000", total: "Rp16.000" },
];
