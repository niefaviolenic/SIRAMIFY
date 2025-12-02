-- ============================================
-- FIX RLS POLICIES - Hapus Infinite Recursion
-- ============================================
-- Script ini akan memperbaiki RLS policies yang menyebabkan infinite recursion
-- ============================================

-- 1. HAPUS SEMUA POLICY LAMA YANG BERMASALAH
DROP POLICY IF EXISTS users_insert_own ON public.users;
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS admin_all_access ON public.users;
DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_insert_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;

-- 2. HAPUS FUNCTION is_admin() LAMA (jika ada masalah)
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. BUAT FUNCTION is_admin() BARU YANG TIDAK RECURSIVE
-- Function ini akan cek role dari auth.users metadata, bukan dari tabel users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Cek role dari auth.users metadata (tidak query tabel users untuk avoid recursion)
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Jika tidak ada di metadata, coba query users table dengan SECURITY DEFINER
  -- Tapi pakai cara yang tidak trigger RLS
  IF user_role IS NULL THEN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid();
  END IF;
  
  RETURN COALESCE(LOWER(user_role), '') = 'admin';
END;
$$;

-- 4. BUAT POLICY SEDERHANA UNTUK SELECT (User bisa lihat data sendiri)
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. BUAT POLICY UNTUK INSERT (User bisa insert data sendiri)
CREATE POLICY users_insert_own ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. BUAT POLICY UNTUK UPDATE (User bisa update data sendiri)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. BUAT POLICY UNTUK ADMIN (Admin bisa akses semua)
-- Pakai function is_admin() yang sudah diperbaiki
CREATE POLICY admin_all_access ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. PASTIKAN RLS ENABLED
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE ADMIN USER METADATA
-- ============================================
-- Pastikan admin user punya role di metadata sebagai backup
-- Ganti 'ADMIN_USER_ID' dengan ID admin yang sebenarnya
-- Atau jalankan query ini untuk update semua admin:
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE role = 'admin'
);

-- ============================================
-- VERIFIKASI
-- ============================================
-- Test query sebagai admin (ganti dengan ID admin yang sebenarnya)
-- SELECT * FROM public.users WHERE id = auth.uid();

