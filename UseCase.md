# Use Case
## Website Manajemen Keuangan

### Tujuan Aplikasi

Membantu pengguna mengelola dan mencatat keuangan pribadi agar dapat mengetahui jumlah pemasukan, pengeluaran, serta kondisi keuangan dalam periode harian, bulanan, dan tahunan.

Sebelum masuk ke HTML, CSS, dan jQuery, kita perlu memahami terlebih dahulu apa yang ingin dibuat, siapa yang akan menggunakannya, dan fitur apa saja yang dibutuhkan.

### 1. Cerita Pengguna (User Story)

**"Apa yang mau dibuat?"**

#### Studi Kasus

Seorang pengguna kesulitan mencatat dan memantau keuangan pribadinya karena pemasukan dan pengeluarannya belum tercatat dengan rapi.

**Aktor:** Pengguna

**Cerita Pengguna:**

Sebagai pengguna, saya ingin mencatat dan mengelola pemasukan serta pengeluaran keuangan saya agar saya dapat mengetahui kondisi keuangan dan memantau riwayat keuangan harian, bulanan, dan tahunan.

### 2. Daftar Use Case (Keinginan Pengguna)

#### a. Use Case 1 (UC-01): Menambah Catatan Keuangan

Pengguna dapat menambahkan catatan transaksi keuangan dengan memasukkan jenis transaksi, jumlah uang, tanggal, dan keterangan transaksi.

Jenis transaksi terdiri dari pemasukan dan pengeluaran.

**Validasi:**
1. Jumlah uang tidak boleh kosong.
2. Jumlah uang harus berupa angka yang lebih besar dari nol.
3. Pengguna harus memilih jenis transaksi.
4. Tanggal transaksi harus diisi.
5. Jika data yang dimasukkan belum lengkap atau tidak valid, sistem menampilkan pesan kesalahan.

#### b. Use Case 2 (UC-02): Melihat Catatan Keuangan

Pengguna dapat melihat seluruh catatan pemasukan dan pengeluaran yang telah ditambahkan untuk mengetahui riwayat transaksi keuangannya.

**Validasi:**
1. Sistem menampilkan daftar transaksi yang tersedia.
2. Jika belum ada transaksi, sistem menampilkan pesan bahwa catatan keuangan masih kosong.
3. Setiap transaksi menampilkan informasi berupa jenis transaksi, jumlah uang, tanggal, dan keterangan.
4. Pengguna dapat membedakan transaksi pemasukan dan pengeluaran.

#### c. Use Case 3 (UC-03): Mengedit Catatan Keuangan

Pengguna dapat mengubah informasi transaksi yang telah dibuat apabila terdapat kesalahan atau perubahan pada data keuangan.

**Validasi:**
1. Pengguna harus memilih transaksi yang ingin diedit.
2. Sistem menampilkan data transaksi yang akan diubah.
3. Data yang diperbarui harus memenuhi ketentuan validasi transaksi.
4. Sistem memperbarui catatan keuangan setelah perubahan disimpan.

#### d. Use Case 4 (UC-04): Menghapus Catatan Keuangan

Pengguna dapat menghapus satu transaksi yang sudah tidak diperlukan atau terdapat kesalahan pencatatan.

**Validasi:**
1. Pengguna harus memilih transaksi yang ingin dihapus.
2. Sistem meminta konfirmasi sebelum transaksi dihapus.
3. Setelah penghapusan dikonfirmasi, transaksi dihapus dari daftar catatan keuangan.
4. Jika pengguna membatalkan konfirmasi, transaksi tidak dihapus.

#### e. Use Case 5 (UC-05): Melihat Ringkasan Keuangan

Pengguna dapat melihat ringkasan keuangan berdasarkan periode harian, bulanan, dan tahunan untuk mengetahui jumlah pemasukan, pengeluaran, serta selisih keduanya.

**Validasi:**
1. Pengguna dapat memilih periode harian, bulanan, atau tahunan.
2. Sistem menampilkan total pemasukan sesuai periode yang dipilih.
3. Sistem menampilkan total pengeluaran sesuai periode yang dipilih.
4. Sistem menghitung selisih keuangan dengan rumus:

   **Saldo Bersih = Total Pemasukan - Total Pengeluaran**

5. Ringkasan keuangan hanya menghitung transaksi yang termasuk dalam periode yang dipilih.
6. Jika belum terdapat transaksi pada periode tersebut, sistem menampilkan nilai pemasukan dan pengeluaran sebesar Rp0.

### 3. Ringkasan Daftar Use Case

| Kode | Nama Use Case |
|---|---|
| UC-01 | Menambah Catatan Keuangan |
| UC-02 | Melihat Catatan Keuangan |
| UC-03 | Mengedit Catatan Keuangan |
| UC-04 | Menghapus Catatan Keuangan |
| UC-05 | Melihat Ringkasan Keuangan |

### 4. Alur Penggunaan Website

1. Pengguna membuka website manajemen keuangan.
2. Pengguna menambahkan transaksi pemasukan atau pengeluaran.
3. Sistem memvalidasi data transaksi.
4. Jika data valid, sistem menyimpan dan menampilkan transaksi.
5. Pengguna dapat melihat, mengedit, atau menghapus catatan keuangan.
6. Pengguna memilih periode harian, bulanan, atau tahunan.
7. Sistem menampilkan ringkasan pemasukan, pengeluaran, dan saldo bersih sesuai periode yang dipilih.
