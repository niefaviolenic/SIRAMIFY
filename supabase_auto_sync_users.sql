-- ============================================
-- AUTO SYNC auth.users -> users TABLE
-- ============================================
-- Script ini akan membuat trigger yang otomatis insert user ke tabel users
-- setiap kali ada user baru di auth.users
-- ============================================

-- 1. Buat function untuk handle new user (dengan SECURITY DEFINER untuk bypass RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Ambil role dari metadata, default 'pembeli' jika tidak ada
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'pembeli');
  
  -- Ambil full_name dari metadata, default dari email jika tidak ada
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Insert ke tabel users dengan bypass RLS (karena SECURITY DEFINER)
  -- Pakai ON CONFLICT untuk handle jika user sudah ada
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_full_name,
    user_role,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error tapi jangan block signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Buat trigger yang akan jalan setiap kali ada user baru di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Pastikan RLS policies untuk users table sudah benar
-- (Hapus policies lama jika ada masalah)
-- DROP POLICY IF EXISTS users_insert_own ON public.users;
-- DROP POLICY IF EXISTS users_select_own ON public.users;
-- DROP POLICY IF EXISTS users_update_own ON public.users;
-- DROP POLICY IF EXISTS admin_all_access ON public.users;

-- 4. Buat RLS policies yang sederhana (jika belum ada)
-- Policy untuk insert: user bisa insert data sendiri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'users_insert_own'
  ) THEN
    CREATE POLICY users_insert_own ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Policy untuk select: user bisa lihat data sendiri, admin bisa lihat semua
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'users_select_own'
  ) THEN
    CREATE POLICY users_select_own ON public.users
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id 
        OR EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Policy untuk update: user bisa update data sendiri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'users_update_own'
  ) THEN
    CREATE POLICY users_update_own ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 5. Function untuk cek admin (tanpa recursive)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- Policy untuk admin: bisa akses semua
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'admin_all_access'
  ) THEN
    CREATE POLICY admin_all_access ON public.users
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 6. Enable RLS pada tabel users (jika belum)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFIKASI
-- ============================================
-- Untuk test, coba daftar user baru dan cek apakah otomatis masuk ke tabel users
-- SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;

