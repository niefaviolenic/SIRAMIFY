"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/app/components/AdminHeader";
import { supabase } from "@/utils/supabaseClient";
import { SkeletonActivity } from "@/app/components/SkeletonAdmin";

export default function AdminPengaturanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData({
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
        });

        // Also try to get from users table
        const { data: userData } = await supabase
          .from("users")
          .select("full_name, email, phone")
          .eq("id", user.id)
          .single();

        if (userData) {
          setFormData({
            full_name: userData.full_name || formData.full_name,
            email: userData.email || formData.email,
            phone: userData.phone || formData.phone,
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("User tidak ditemukan");
        return;
      }

      // Update in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (authError) throw authError;

      // Update in users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      alert("Profil berhasil diperbarui!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("User tidak ditemukan");
        return;
      }

      // Delete from users table
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) throw deleteError;

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/masuk");
      alert("Akun berhasil dihapus");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert("Gagal menghapus akun. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-8" style={{ paddingLeft: '10px' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-bold text-2xl text-black">Pengaturan</h1>
              <p className="text-xs text-black mt-1">Pengaturan Profil Admin</p>
            </div>
            <div className="flex-shrink-0">
              <AdminHeader />
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        {!formData.email ? (
          <SkeletonActivity />
        ) : (
          <div className="border border-[#9e1c60] rounded-[10px] p-6 bg-white mb-6">
            <h2 className="font-bold text-lg text-black mb-4">Profil Saya</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#9e1c60] text-white rounded-lg font-bold hover:bg-[#7a1548] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="border border-red-500 rounded-[10px] p-6 bg-red-50">
          <h2 className="font-bold text-lg text-red-600 mb-4">Zona Berbahaya</h2>
          <p className="text-sm text-gray-700 mb-4">
            Tindakan di bawah ini tidak dapat dibatalkan. Hati-hati saat melakukan tindakan ini.
          </p>
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition cursor-pointer"
          >
            Hapus Akun
          </button>
        </div>
      </div>


      {/* Delete Account Modal */}
      {
        showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="font-bold text-lg text-black mb-4">Hapus Akun</h3>
              <p className="text-sm text-gray-700 mb-6">
                Apakah Anda yakin ingin menghapus akun admin ini? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus secara permanen.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

