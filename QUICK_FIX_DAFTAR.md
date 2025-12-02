# Quick Fix - Error "Database error saving new user"

## 🔴 Masalah
Trigger `handle_new_user()` error saat insert ke tabel `users`, menyebabkan signup gagal.

## ✅ Solusi Cepat (Pilih Salah Satu)

### Opsi 1: Disable Trigger Sementara (RECOMMENDED)

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy semua isi file `disable_trigger_temporary.sql`
3. Paste dan **Run**

Ini akan disable trigger, jadi:
- ✅ User tetap bisa daftar (masuk ke `auth.users`)
- ✅ Frontend code akan insert ke tabel `users` (sudah ada di kode)
- ✅ Tidak ada error "Database error saving new user"

### Opsi 2: Fix RLS Policy + Update Trigger

1. Jalankan `fix_rls_policies.sql` dulu (untuk fix RLS)
2. Jalankan `supabase_auto_sync_users.sql` lagi (untuk update trigger dengan exception handling)

## 🧪 Test

Setelah fix:
1. Coba daftar user baru
2. Cek di Supabase:
   - **Authentication** → **Users** → harus ada user baru
   - **Table Editor** → **users** → harus ada user baru juga

## 📝 Catatan

- Jika pakai Opsi 1 (disable trigger), user akan tetap otomatis masuk ke tabel `users` via frontend code
- Trigger bisa di-enable lagi nanti setelah RLS policy sudah benar

