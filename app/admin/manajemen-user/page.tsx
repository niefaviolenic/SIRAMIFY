"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/app/components/AdminHeader";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { SkeletonTable } from "@/app/components/SkeletonAdmin";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/e12eaffa-ec34-4b35-ac23-8b0719bfdc0d";
const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/2b8b2938-0c34-49e2-b4a7-762bbfa895f7";

interface User {
  id: string;
  email: string;
  role: string;
  status: "aktif" | "nonaktif";
  created_at: string;
  full_name?: string;
}

export default function ManajemenUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    role: "",
    status: "aktif" as "aktif" | "nonaktif",
    full_name: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map data to include status (default to aktif if not set)
      const mappedUsers = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email || "",
        role: user.role || "pembeli",
        status: user.status || "aktif",
        created_at: user.created_at || new Date().toISOString(),
        full_name: user.full_name || user.name || "",
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      // Mock data for development
      setUsers([
        {
          id: "1",
          email: "petani1@example.com",
          role: "petani",
          status: "aktif",
          created_at: "2025-01-15T10:00:00Z",
          full_name: "Petani Satu",
        },
        {
          id: "2",
          email: "pembeli1@example.com",
          role: "pembeli",
          status: "aktif",
          created_at: "2025-01-14T09:00:00Z",
          full_name: "Pembeli Satu",
        },
        {
          id: "3",
          email: "petani2@example.com",
          role: "petani",
          status: "nonaktif",
          created_at: "2025-01-13T08:00:00Z",
          full_name: "Petani Dua",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.email.toLowerCase().includes(query) ||
          (user.full_name && user.full_name.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      role: user.role,
      status: user.status,
      full_name: user.full_name || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus user. Silakan coba lagi.");
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "aktif" ? "nonaktif" : "aktif";
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      setUsers(users.map(u => (u.id === user.id ? { ...u, status: newStatus } : u)));
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Gagal mengubah status user. Silakan coba lagi.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          email: editFormData.email,
          role: editFormData.role,
          status: editFormData.status,
          full_name: editFormData.full_name,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers(users.map(u => (u.id === selectedUser.id ? { ...u, ...editFormData } : u)));
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Gagal mengupdate user. Silakan coba lagi.");
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="p-8" style={{ paddingLeft: '10px' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-bold text-2xl text-black">Manajemen User</h1>
              <p className="text-xs text-black mt-1">Kelola semua user sistem</p>
            </div>
            <div className="flex-shrink-0">
              <AdminHeader />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari user (email, nama)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
            >
              <option value="all">Semua Role</option>
              <option value="petani">Petani</option>
              <option value="pembeli">Pembeli</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-full md:w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Table Skeleton */}
            <div className="border border-gray-200 rounded-[10px] overflow-hidden">
              <div className="bg-gray-100 h-10 w-full animate-pulse"></div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-[#9e1c60] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#9e1c60] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Tanggal Registrasi</th>
                    <th className="px-4 py-3 text-center text-xs font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        Tidak ada user ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-black">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-black">{user.full_name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-black capitalize">{user.role}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === "aktif"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {user.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(user)}
                              className="p-1 hover:bg-gray-200 rounded transition cursor-pointer"
                              title="Detail"
                            >
                              <span className="text-xs text-[#9e1c60]">Detail</span>
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 hover:bg-gray-200 rounded transition cursor-pointer"
                              title="Edit"
                            >
                              <Image
                                src={imgIconamoonEditLight}
                                alt="Edit"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)' }}
                                unoptimized
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-1 hover:bg-gray-200 rounded transition cursor-pointer"
                              title="Hapus"
                            >
                              <Image
                                src={imgMaterialSymbolsDeleteRounded}
                                alt="Delete"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)' }}
                                unoptimized
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Hapus User</h3>
            <p className="text-sm text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{selectedUser.email}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                >
                  <option value="petani">Petani</option>
                  <option value="pembeli">Pembeli</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "aktif" | "nonaktif" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548] cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Detail User</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-bold text-black">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama Lengkap</p>
                <p className="text-sm font-bold text-black">{selectedUser.full_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-bold text-black capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-bold text-black capitalize">{selectedUser.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tanggal Registrasi</p>
                <p className="text-sm font-bold text-black">{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

