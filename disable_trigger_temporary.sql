-- ============================================
-- DISABLE TRIGGER TEMPORARY (Jika Trigger Error)
-- ============================================
-- Gunakan script ini jika trigger menyebabkan error saat signup
-- Setelah fix RLS, enable lagi trigger-nya
-- ============================================

-- Disable trigger sementara
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Untuk enable lagi nanti, jalankan:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

