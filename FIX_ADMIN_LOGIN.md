# Fix Admin Login - Infinite Recursion RLS Error

## 🔴 Masalah
1. **RLS Policy Error**: "infinite recursion detected in policy for relation 'users'"
2. **Query Gagal**: Tidak bisa ambil role dari tabel `users`
3. **Fallback Salah**: Pakai metadata role "pembeli" (bukan "admin")
4. **Redirect Salah**: Redirect ke landing page (bukan `/admin/beranda`)

## ✅ Solusi

### Step 1: Fix RLS Policies di Supabase

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy semua isi file `fix_rls_policies.sql`
3. Paste dan **Run** di SQL Editor

Script ini akan:
- ✅ Hapus semua RLS policy lama yang recursive
- ✅ Buat RLS policy baru yang sederhana (tidak recursive)
- ✅ Update metadata admin user di `auth.users`

### Step 2: Update Admin User Metadata (Jika Perlu)

Jalankan query ini untuk update metadata admin:

```sql
-- Update admin user metadata
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@siramify.com';
```

### Step 3: Verifikasi

1. Coba login lagi sebagai admin
2. Buka Console browser (F12)
3. Pastikan tidak ada error "infinite recursion"
4. Pastikan redirect ke `/admin/beranda`

## 🔍 Debug

Jika masih error, cek:

1. **RLS Policy**: 
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Admin User Role**:
   ```sql
   SELECT id, email, role, status FROM public.users WHERE email = 'admin@siramify.com';
   ```

3. **Auth Metadata**:
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'admin@siramify.com';
   ```

