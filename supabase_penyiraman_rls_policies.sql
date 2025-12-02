-- RLS Policies untuk tabel penyiraman
-- Jalankan script ini di Supabase SQL Editor

-- 1. Enable Row Level Security (RLS) pada tabel penyiraman
ALTER TABLE penyiraman ENABLE ROW LEVEL SECURITY;

-- 2. Policy untuk SELECT (Read) - Semua authenticated users bisa membaca
CREATE POLICY "Allow read for authenticated users" 
ON penyiraman 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Policy untuk UPDATE (Edit) - Semua authenticated users bisa mengedit
CREATE POLICY "Allow update for authenticated users" 
ON penyiraman 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Policy untuk DELETE (Hapus) - Semua authenticated users bisa menghapus
CREATE POLICY "Allow delete for authenticated users" 
ON penyiraman 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. Policy untuk INSERT (Tambah) - Jika diperlukan untuk menambah data baru
CREATE POLICY "Allow insert for authenticated users" 
ON penyiraman 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Catatan:
-- - Policy ini mengizinkan semua authenticated users (yang sudah login) untuk melakukan operasi CRUD
-- - Jika ingin lebih ketat, bisa tambahkan filter berdasarkan user_id
--   Contoh: USING (auth.uid() = user_id) untuk hanya mengizinkan user yang punya data tersebut

