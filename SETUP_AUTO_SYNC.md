# Setup Auto Sync auth.users → users Table

## 🎯 Tujuan
Membuat sistem yang **OTOMATIS** memasukkan user baru dari `auth.users` ke tabel `users` tanpa perlu input manual.

## 📋 Langkah-langkah

### 1. Buka Supabase Dashboard
- Login ke [Supabase Dashboard](https://app.supabase.com)
- Pilih project Siramify

### 2. Buka SQL Editor
- Klik menu **SQL Editor** di sidebar kiri
- Klik tombol **New Query**

### 3. Copy & Paste Script
- Buka file `supabase_auto_sync_users.sql` yang sudah dibuat
- Copy **SEMUA** isinya
- Paste ke SQL Editor di Supabase

### 4. Jalankan Script
- Klik tombol **Run** (atau tekan `Ctrl+Enter` / `Cmd+Enter`)
- Pastikan tidak ada error (harus muncul "Success. No rows returned")

### 5. Verifikasi Trigger
Jalankan query ini untuk cek apakah trigger sudah dibuat:
```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Harus muncul 1 row dengan:
- `trigger_name`: `on_auth_user_created`
- `event_object_table`: `users` (dari schema `auth`)

### 6. Test Auto Sync
1. Daftar user baru di web (halaman `/daftar`)
2. Setelah berhasil daftar, cek di Supabase:
   - **Authentication** → **Users** → harus ada user baru
   - **Table Editor** → **users** → harus **OTOMATIS** ada user baru juga!

## ✅ Hasil yang Diharapkan

Setelah setup ini:
- ✅ User baru di `auth.users` → **OTOMATIS** masuk ke tabel `users`
- ✅ Tidak perlu input manual lagi
- ✅ Frontend code tetap ada sebagai **backup** (jika trigger gagal)
- ✅ Status user otomatis `active`
- ✅ Role otomatis sesuai pilihan saat daftar

## 🔧 Troubleshooting

### Jika trigger tidak jalan:
1. Cek apakah function `handle_new_user()` sudah dibuat:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
   ```

2. Cek apakah trigger sudah aktif:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. Test manual function:
   ```sql
   -- Ganti 'USER_ID_DARI_AUTH_USERS' dengan ID user yang baru daftar
   SELECT public.handle_new_user();
   ```

### Jika masih error:
- Pastikan RLS policies tidak menghalangi
- Cek log di Supabase Dashboard → **Logs** → **Postgres Logs**

## 📝 Catatan

- Trigger ini berjalan di **level database**, jadi lebih reliable
- Frontend code di `app/daftar/page.tsx` tetap ada sebagai **fallback**
- Jika trigger gagal, frontend akan tetap insert user ke tabel `users`

