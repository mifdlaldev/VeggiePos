# Rancangan Struktur Website VeggiePOS

## 1. Tujuan Website
VeggiePOS adalah website penjualan sayuran yang dipakai oleh dua jenis pengguna:

- `Admin`: mengelola data sayuran, user, dan laporan.
- `Kasir`: melakukan transaksi penjualan dan mencetak struk.

Fokus utama website adalah cepat dipakai di meja kasir, mudah dipahami admin, dan sederhana saat dikembangkan.

## 2. Struktur Peran Pengguna

### Admin
- Login ke sistem
- Melihat ringkasan dashboard
- Mengelola data sayuran
- Mengelola data user
- Melihat laporan penjualan
- Melihat laporan stok
- Logout

### Kasir
- Login ke sistem
- Membuka halaman transaksi
- Mencari sayuran / melihat harga
- Menambah item ke keranjang
- Menginput pembayaran
- Menyimpan transaksi
- Mencetak struk
- Logout

## 3. Sitemap Website

### Halaman Umum
- `/login`

### Area Admin
- `/admin/dashboard`
- `/admin/produk`
- `/admin/produk/tambah`
- `/admin/produk/:id/edit`
- `/admin/users`
- `/admin/users/tambah`
- `/admin/users/:id/edit`
- `/admin/laporan/penjualan`
- `/admin/laporan/stok`
- `/admin/profil`

### Area Kasir
- `/kasir/dashboard`
- `/kasir/transaksi`
- `/kasir/riwayat`
- `/kasir/profil`

### Halaman Sistem
- `/403`
- `/404`

## 4. Struktur Navigasi per Role

### Menu Sidebar Admin
- Dashboard
- Data Sayuran
- Data User
- Laporan Penjualan
- Laporan Stok
- Profil
- Logout

### Menu Sidebar Kasir
- Dashboard
- Transaksi Kasir
- Riwayat Transaksi
- Profil
- Logout

## 5. Rancangan Tiap Halaman

### Login
Tujuan:
- Autentikasi pengguna berdasarkan `username` dan `password`
- Arahkan user sesuai level (`admin` atau `kasir`)

Komponen:
- Logo dan nama `VeggiePOS`
- Form username
- Form password
- Tombol login
- Pesan error jika login gagal

### Dashboard Admin
Tujuan:
- Memberi gambaran cepat kondisi toko

Komponen:
- Ringkasan total produk
- Ringkasan stok menipis
- Ringkasan jumlah user
- Ringkasan penjualan hari ini
- Shortcut ke menu produk, user, dan laporan

### Data Sayuran
Tujuan:
- CRUD data produk sayuran

Komponen:
- Tabel produk
- Kolom: nama sayur, harga, stok
- Pencarian produk
- Tombol tambah produk
- Tombol edit
- Tombol hapus
- Validasi input kosong

### Form Tambah / Edit Sayuran
Komponen:
- Input nama sayur
- Input harga
- Input stok
- Tombol simpan
- Tombol batal
- Pesan sukses / gagal

### Data User
Tujuan:
- Admin mengelola akun pengguna

Komponen:
- Tabel user
- Kolom: username, nama lengkap, level
- Tombol tambah user
- Tombol edit user
- Tombol hapus user

### Form Tambah / Edit User
Komponen:
- Input username
- Input password
- Input nama lengkap
- Pilihan level: `admin` / `kasir`
- Tombol simpan

### Laporan Penjualan
Tujuan:
- Menampilkan histori transaksi penjualan

Komponen:
- Filter tanggal
- Tabel transaksi
- Kolom: tanggal, kasir, total bayar, uang bayar, kembalian
- Tombol lihat detail transaksi
- Opsi cetak / export di tahap lanjutan

### Laporan Stok
Tujuan:
- Melihat kondisi stok produk

Komponen:
- Tabel stok produk
- Filter produk
- Indikator stok rendah

### Dashboard Kasir
Tujuan:
- Memudahkan kasir masuk cepat ke transaksi

Komponen:
- Ringkasan transaksi hari ini
- Shortcut ke halaman transaksi
- Riwayat transaksi singkat

### Transaksi Kasir
Tujuan:
- Menjalankan penjualan dari pilih barang sampai cetak struk

Layout:
- Panel kiri: daftar produk / pencarian
- Panel kanan: keranjang dan pembayaran

Komponen kiri:
- Search bar produk
- Tabel / kartu produk
- Informasi harga
- Informasi stok
- Input qty
- Tombol tambah ke keranjang

Komponen kanan:
- Daftar item keranjang
- Qty per item
- Subtotal per item
- Total belanja
- Input uang bayar
- Hitung kembalian otomatis
- Tombol simpan transaksi
- Tombol cetak struk
- Tombol reset keranjang

Validasi:
- Tidak boleh checkout jika keranjang kosong
- Qty tidak boleh melebihi stok
- Uang bayar tidak boleh kurang dari total

### Riwayat Transaksi Kasir
Tujuan:
- Kasir melihat transaksi yang sudah dilakukan

Komponen:
- Tabel riwayat transaksi
- Filter tanggal
- Tombol lihat detail
- Tombol cetak ulang struk

### Profil
Komponen:
- Informasi nama lengkap
- Username
- Level user
- Opsi ubah password di tahap lanjutan

## 6. Alur Navigasi Utama

### Alur Admin
1. Login
2. Masuk ke dashboard admin
3. Pilih menu `Data Sayuran`, `Data User`, atau `Laporan`
4. Lakukan aksi tambah, edit, hapus, atau lihat data
5. Logout

### Alur Kasir
1. Login
2. Masuk ke dashboard kasir
3. Buka halaman transaksi
4. Cari produk dan input qty
5. Tambah ke keranjang
6. Input uang bayar
7. Simpan transaksi
8. Cetak struk
9. Keranjang direset untuk transaksi berikutnya

## 7. Komponen Global Website

Komponen yang dipakai di banyak halaman:

- Header / topbar
- Sidebar navigasi
- Breadcrumb
- Tabel data
- Modal konfirmasi hapus
- Form input standar
- Alert sukses / gagal
- Badge level user
- Badge status stok
- Empty state jika data kosong

## 8. Struktur Modul Sistem

Modul utama VeggiePOS:

- `Autentikasi`
- `Manajemen Produk`
- `Manajemen User`
- `Transaksi Penjualan`
- `Laporan`
- `Cetak Struk`

## 9. Struktur Data yang Dipakai

### Tabel `users`
- `id_user`
- `username`
- `password`
- `nama_lengkap`
- `level`

### Tabel `produk`
- `id_produk`
- `nama_sayur`
- `harga`
- `stok`

### Tabel `transaksi`
- `id_transaksi`
- `id_user`
- `tgl_transaksi`
- `total_bayar`
- `uang_bayar`
- `kembalian`

### Tabel `detail_transaksi`
- `id_detail`
- `id_transaksi`
- `id_produk`
- `qty`
- `subtotal`

## 10. Rekomendasi Struktur Folder Implementasi

Berikut struktur yang rapi jika nanti website dibangun dengan pendekatan modern:

```text
veggiepos/
├── docs/
│   └── rancangan-struktur-website.md
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── produk/
│   │   │   ├── users/
│   │   │   └── laporan/
│   │   └── kasir/
│   │       ├── dashboard/
│   │       ├── transaksi/
│   │       └── riwayat/
│   ├── components/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── transaksi/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── helpers/
│   │   └── validations/
│   ├── services/
│   │   ├── produk/
│   │   ├── users/
│   │   ├── transaksi/
│   │   └── laporan/
│   └── types/
└── persyaratan/
```

## 11. Prioritas Implementasi Bertahap

Urutan implementasi yang disarankan:

1. Setup halaman login dan proteksi role user
2. Buat layout utama admin dan kasir
3. Buat modul data sayuran
4. Buat modul transaksi kasir
5. Buat modul cetak struk
6. Buat modul data user
7. Buat modul laporan

## 12. Kesimpulan Rancangan

Struktur VeggiePOS sebaiknya dibagi jelas antara area `admin` dan `kasir`, dengan fokus utama pada:

- navigasi sederhana
- transaksi cepat
- pengelolaan stok yang mudah
- laporan yang mudah dibaca

Dokumen ini bisa langsung dijadikan acuan saat masuk ke tahap wireframe atau implementasi.
