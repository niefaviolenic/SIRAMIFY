"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/e12eaffa-ec34-4b35-ac23-8b0719bfdc0d";
const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/2b8b2938-0c34-49e2-b4a7-762bbfa895f7";
const imgTypcnPlus = "https://www.figma.com/api/mcp/asset/30828167-db43-4a98-a913-e4c3caf6eeb3";

interface System {
  id: string;
  name: string;
  petani_id?: string;
  petani_name?: string;
  location: string;
  status: "aktif" | "nonaktif";
  installed_at: string;
  firmware_version?: string;
}

export default function ManajemenSistemPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    petani_id: "",
    location: "",
    status: "aktif" as "aktif" | "nonaktif",
    firmware_version: "",
  });

  useEffect(() => {
    loadSystems();
  }, []);

  useEffect(() => {
    filterSystems();
  }, [searchQuery, statusFilter, systems]);

  const loadSystems = async () => {
    try {
      const { data, error } = await supabase
        .from("systems")
        .select(`
          *,
          petani:users!systems_petani_id_fkey(full_name, email)
        `)
        .order("installed_at", { ascending: false });

      if (error) {
        // Check if error is because table doesn't exist or empty error
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        const errorKeys = Object.keys(error).length;
        const errorString = JSON.stringify(error);
        
        // Check if error is empty or table not found
        const isEmptyError = errorKeys === 0 || errorString === '{}' || (!errorMessage && !errorCode);
        const isTableNotFound = errorCode === 'PGRST116' || 
                                errorMessage?.includes('does not exist') ||
                                errorMessage?.includes('relation') ||
                                errorMessage?.includes('not found') ||
                                isEmptyError;
        
        if (isTableNotFound) {
          // Table doesn't exist yet, use mock data silently
          setSystems([
            {
              id: "1",
              name: "Robot Penyiram Selada #1",
              petani_name: "Petani Satu",
              location: "Lahan A, Blok 1",
              status: "aktif",
              installed_at: "2025-01-15T10:00:00Z",
              firmware_version: "v1.2.3",
            },
            {
              id: "2",
              name: "Robot Penyiram Selada #2",
              petani_name: "Petani Dua",
              location: "Lahan B, Blok 2",
              status: "aktif",
              installed_at: "2025-01-14T09:00:00Z",
              firmware_version: "v1.2.1",
            },
            {
              id: "3",
              name: "Robot Penyiram Selada #3",
              petani_name: "Petani Satu",
              location: "Lahan A, Blok 3",
              status: "nonaktif",
              installed_at: "2025-01-13T08:00:00Z",
              firmware_version: "v1.1.5",
            },
          ]);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (data) {
        const mappedSystems = data.map((system: any) => ({
          id: system.id,
          name: system.name || system.nama_sistem || "",
          petani_id: system.petani_id,
          petani_name: system.petani?.full_name || system.petani?.email || "Unknown",
          location: system.location || system.lokasi || "",
          status: system.status || "aktif",
          installed_at: system.installed_at || system.created_at || new Date().toISOString(),
          firmware_version: system.firmware_version || system.versi_firmware || "v1.0.0",
        }));
        setSystems(mappedSystems);
      }
    } catch (error: any) {
      // Check if error is because table doesn't exist or empty error object
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';
      const errorKeys = error ? Object.keys(error).length : 0;
      const errorString = JSON.stringify(error || {});
      
      // Check if error is empty or table not found
      const isEmptyError = errorKeys === 0 || errorString === '{}' || (!errorMessage && !errorCode);
      const isTableNotFound = errorCode === 'PGRST116' || 
                              errorMessage?.includes('does not exist') ||
                              errorMessage?.includes('relation') ||
                              errorMessage?.includes('not found') ||
                              isEmptyError;
      
      // Only log error if it's a real error with meaningful message
      if (!isTableNotFound && errorMessage && errorKeys > 0) {
        console.error("Error loading systems:", error);
      }
      
      // Mock data
      setSystems([
        {
          id: "1",
          name: "Robot Penyiram Selada #1",
          petani_name: "Petani Satu",
          location: "Lahan A, Blok 1",
          status: "aktif",
          installed_at: "2025-01-15T10:00:00Z",
          firmware_version: "v1.2.3",
        },
        {
          id: "2",
          name: "Robot Penyiram Selada #2",
          petani_name: "Petani Dua",
          location: "Lahan B, Blok 2",
          status: "aktif",
          installed_at: "2025-01-14T09:00:00Z",
          firmware_version: "v1.2.1",
        },
        {
          id: "3",
          name: "Robot Penyiram Selada #3",
          petani_name: "Petani Satu",
          location: "Lahan A, Blok 3",
          status: "nonaktif",
          installed_at: "2025-01-13T08:00:00Z",
          firmware_version: "v1.1.5",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSystems = () => {
    let filtered = [...systems];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(system => system.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        system =>
          system.name.toLowerCase().includes(query) ||
          (system.petani_name && system.petani_name.toLowerCase().includes(query)) ||
          system.location.toLowerCase().includes(query) ||
          system.id.toLowerCase().includes(query)
      );
    }

    setFilteredSystems(filtered);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      petani_id: "",
      location: "",
      status: "aktif",
      firmware_version: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (system: System) => {
    setSelectedSystem(system);
    setFormData({
      name: system.name,
      petani_id: system.petani_id || "",
      location: system.location,
      status: system.status,
      firmware_version: system.firmware_version || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (system: System) => {
    setSelectedSystem(system);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSystem) return;

    try {
      const { error } = await supabase
        .from("systems")
        .delete()
        .eq("id", selectedSystem.id);

      if (error) throw error;

      setSystems(systems.filter(s => s.id !== selectedSystem.id));
      setShowDeleteModal(false);
      setSelectedSystem(null);
    } catch (error) {
      console.error("Error deleting system:", error);
      alert("Gagal menghapus sistem. Silakan coba lagi.");
      setShowDeleteModal(false);
      setSelectedSystem(null);
    }
  };

  const handleToggleStatus = async (system: System) => {
    try {
      const newStatus = system.status === "aktif" ? "nonaktif" : "aktif";
      const { error } = await supabase
        .from("systems")
        .update({ status: newStatus })
        .eq("id", system.id);

      if (error) throw error;

      setSystems(systems.map(s => (s.id === system.id ? { ...s, status: newStatus } : s)));
    } catch (error) {
      console.error("Error updating system status:", error);
      alert("Gagal mengubah status sistem. Silakan coba lagi.");
    }
  };

  const handleSaveAdd = async () => {
    try {
      const { error } = await supabase
        .from("systems")
        .insert({
          name: formData.name,
          petani_id: formData.petani_id || null,
          location: formData.location,
          status: formData.status,
          firmware_version: formData.firmware_version,
          installed_at: new Date().toISOString(),
        });

      if (error) throw error;

      await loadSystems();
      setShowAddModal(false);
      setFormData({
        name: "",
        petani_id: "",
        location: "",
        status: "aktif",
        firmware_version: "",
      });
    } catch (error) {
      console.error("Error adding system:", error);
      alert("Gagal menambahkan sistem. Silakan coba lagi.");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSystem) return;

    try {
      const { error } = await supabase
        .from("systems")
        .update({
          name: formData.name,
          petani_id: formData.petani_id || null,
          location: formData.location,
          status: formData.status,
          firmware_version: formData.firmware_version,
        })
        .eq("id", selectedSystem.id);

      if (error) throw error;

      await loadSystems();
      setShowEditModal(false);
      setSelectedSystem(null);
    } catch (error) {
      console.error("Error updating system:", error);
      alert("Gagal mengupdate sistem. Silakan coba lagi.");
    }
  };

  const handleViewDetail = (system: System) => {
    setSelectedSystem(system);
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Manajemen Sistem</h1>
                <p className="text-xs text-black mt-1">Kelola semua sistem/robot</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-[#9e1c60] text-white rounded-lg hover:bg-[#7a1548] transition"
                >
                  <Image
                    src={imgTypcnPlus}
                    alt="Add"
                    width={16}
                    height={16}
                    className="object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                    unoptimized
                  />
                  <span className="text-sm font-bold">Tambah Sistem</span>
                </button>
                <AdminHeader />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari sistem (ID, nama, petani, lokasi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-[#9e1c60] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#9e1c60] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#9e1c60] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold">ID Sistem</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Nama Sistem</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Petani Pemilik</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Lokasi</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Tanggal Instalasi</th>
                    <th className="px-4 py-3 text-center text-xs font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredSystems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Tidak ada sistem ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredSystems.map((system) => (
                      <tr key={system.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-black">#{system.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-black">{system.name}</td>
                        <td className="px-4 py-3 text-sm text-black">{system.petani_name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-black">{system.location}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(system)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              system.status === "aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {system.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(system.installed_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(system)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                              title="Detail"
                            >
                              <span className="text-xs text-[#9e1c60]">Detail</span>
                            </button>
                            <button
                              onClick={() => handleEdit(system)}
                              className="p-1 hover:bg-gray-200 rounded transition"
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
                              onClick={() => handleDeleteClick(system)}
                              className="p-1 hover:bg-gray-200 rounded transition"
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
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Tambah Sistem</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama Sistem</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  placeholder="Contoh: Robot Penyiram Selada #1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Petani ID (Opsional)</label>
                <input
                  type="text"
                  value={formData.petani_id}
                  onChange={(e) => setFormData({ ...formData, petani_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  placeholder="Contoh: Lahan A, Blok 1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "aktif" | "nonaktif" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Versi Firmware</label>
                <input
                  type="text"
                  value={formData.firmware_version}
                  onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  placeholder="Contoh: v1.2.3"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Hapus Sistem</h3>
            <p className="text-sm text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus sistem <strong>{selectedSystem.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSystem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Edit Sistem</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nama Sistem</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Petani ID</label>
                <input
                  type="text"
                  value={formData.petani_id}
                  onChange={(e) => setFormData({ ...formData, petani_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "aktif" | "nonaktif" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Versi Firmware</label>
                <input
                  type="text"
                  value={formData.firmware_version}
                  onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSystem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-black mb-4">Detail Sistem</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">ID Sistem</p>
                <p className="text-sm font-bold text-black">#{selectedSystem.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nama Sistem</p>
                <p className="text-sm font-bold text-black">{selectedSystem.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Petani Pemilik</p>
                <p className="text-sm font-bold text-black">{selectedSystem.petani_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lokasi</p>
                <p className="text-sm font-bold text-black">{selectedSystem.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-bold text-black capitalize">{selectedSystem.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tanggal Instalasi</p>
                <p className="text-sm font-bold text-black">{formatDate(selectedSystem.installed_at)}</p>
              </div>
              {selectedSystem.firmware_version && (
                <div>
                  <p className="text-xs text-gray-500">Versi Firmware</p>
                  <p className="text-sm font-bold text-black">{selectedSystem.firmware_version}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSystem(null);
                }}
                className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548]"
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

