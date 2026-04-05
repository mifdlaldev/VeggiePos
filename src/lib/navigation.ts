export type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

export const adminNavigation: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", badge: "01" },
  { href: "/admin/produk", label: "Data Sayuran", badge: "14" },
  { href: "/admin/users", label: "Data User", badge: "06" },
  {
    href: "/admin/laporan/penjualan",
    label: "Laporan Penjualan",
    badge: "24",
  },
  { href: "/admin/laporan/stok", label: "Laporan Stok", badge: "08" },
];

export const cashierNavigation: NavItem[] = [
  { href: "/kasir/dashboard", label: "Dashboard", badge: "01" },
  { href: "/kasir/transaksi", label: "Transaksi Kasir", badge: "24" },
  { href: "/kasir/riwayat", label: "Riwayat", badge: "08" },
];
