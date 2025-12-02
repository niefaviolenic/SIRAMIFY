"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import ProfilModal from "@/app/components/ProfilModal";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

const imgPiconOn = "https://www.figma.com/api/mcp/asset/84c43792-daf1-4448-8bbd-f4679a79c151";
const imgMaterialSymbolsEditOutline = "https://www.figma.com/api/mcp/asset/cd5ae161-5c06-43e6-bc45-ee101a8ad404";
const imgMdiBellNotificationOutline = "https://www.figma.com/api/mcp/asset/4a3441c2-9993-4b00-809e-50a1f97e6953";
const imgMaterialIconThemeTodo = "https://www.figma.com/api/mcp/asset/fbc3f58e-ad1a-4270-b0c0-94c6b0d89dfd";
const imgImage13 = "https://www.figma.com/api/mcp/asset/3c730379-48bc-4348-9b10-f7432fde9700";

export default function PengaturanPage() {
  const router = useRouter();
  const [robotStatus, setRobotStatus] = useState({
    isOnline: true,
    isRunning: false,
    namaDevice: "Robot Penyiram Selada #1",
    versiFirmware: "v1.2.3",
    totalPenyiramanHariIni: 5,
    terakhirAktif: "2 menit yang lalu",
  });
  const [notifications, setNotifications] = useState({
    penyiraman: true,
    suhuEkstrem: true,
    kelembapanEkstrem: false,
    stokMenipis: true,
  });
  const [generalSettings, setGeneralSettings] = useState({
    bahasa: "id",
    tema: "light",
  });
  const [formData, setFormData] = useState({
    namaToko: "Gerai Siramify",
    nomorHP: "+62 812 3456 7890",
    alamatLengkap: "Jln. Mawar No.5, Rt/RW 001/002, Kab. Selada, Kec. Merah, Kota OctoCrew",
    deskripsiToko: "Gerai Siramify adalah toko resmi yang menyediakan kebutuhan pertanian cerdas berbasis teknologi. Kami menghadirkan produk tanaman, perlengkapan perawatan, serta layanan pendukung yang terintegrasi dengan sistem Siramify agar petani dapat mengelola tanaman dengan lebih efisien, praktis, dan modern.",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isProfilModalOpen, setIsProfilModalOpen] = useState(false);
  const [storeImage, setStoreImage] = useState(imgImage13);
  const storeImageInputRef = useRef<HTMLInputElement>(null);
  const [riwayatPembelian] = useState([
    {
      id: "1",
      foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
      namaProduk: "Benih Selada Merah",
      jumlah: 2,
      totalHarga: "Rp14.000",
      tanggalPembelian: "15 Jan 2024",
      statusPembayaran: "Sudah Bayar",
      statusPengiriman: "Selesai",
    },
    {
      id: "2",
      foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
      namaProduk: "Selada Oakloaf Merah",
      jumlah: 1,
      totalHarga: "Rp32.000",
      tanggalPembelian: "12 Jan 2024",
      statusPembayaran: "Sudah Bayar",
      statusPengiriman: "Dikirim",
    },
    {
      id: "3",
      foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
      namaProduk: "Pupuk Organik",
      jumlah: 3,
      totalHarga: "Rp291.000",
      tanggalPembelian: "10 Jan 2024",
      statusPembayaran: "Belum Bayar",
      statusPengiriman: "Belum Dikirim",
    },
  ]);

  const getStatusPembayaranColor = (status: string) => {
    switch (status) {
      case "Sudah Bayar":
        return "#106113";
      case "Belum Bayar":
        return "#dc2626";
      case "Dikembalikan":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusPengirimanColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "#106113";
      case "Dikirim":
        return "#3b82f6";
      case "Pengemasan":
        return "#ff9500";
      case "Belum Dikirim":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const handleToggleRobot = () => {
    setRobotStatus({ ...robotStatus, isRunning: !robotStatus.isRunning });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Data toko berhasil disimpan!");
    } catch (error: any) {
      console.error("Error saving store data:", error);
      alert("Gagal menyimpan data toko. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStoreImageClick = () => {
    storeImageInputRef.current?.click();
  };

  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }
      
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("User tidak ditemukan");
        return;
      }

      // TODO: Delete user account and all related data from Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    <div className="min-h-screen bg-[#fef7f5] flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen bg-[#fef7f5]" style={{ minHeight: '100vh', width: 'calc(100% - 180px)', paddingBottom: '40px' }}>
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Pengaturan</h1>
                <p className="text-sm text-black mt-1">Pengaturan</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Status Sistem & Notifikasi Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Robot Penyiram Card */}
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <h2 className="font-bold text-black mb-3" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Robot Penyiram
              </h2>
              
              {/* Status Koneksi */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${robotStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-normal text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {robotStatus.isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Info Ringkas - Grid 2 kolom */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-black mb-1" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Device
                  </p>
                  <p className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {robotStatus.namaDevice}
                  </p>
                </div>
                <div>
                  <p className="text-black mb-1" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Firmware
                  </p>
                  <p className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {robotStatus.versiFirmware}
                  </p>
                </div>
                <div>
                  <p className="text-black mb-1" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Penyiraman Hari Ini
                  </p>
                  <p className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {robotStatus.totalPenyiramanHariIni}x
                  </p>
                </div>
                <div>
                  <p className="text-black mb-1" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Terakhir Aktif
                  </p>
                  <p className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {robotStatus.terakhirAktif}
                  </p>
                </div>
              </div>

              {/* Kontrol Cepat */}
              <button
                onClick={handleToggleRobot}
                disabled={!robotStatus.isOnline}
                className={`w-full h-[35px] rounded-[5px] text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                  robotStatus.isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-[#27a73d] hover:bg-[#1f8a31]'
                }`}
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                {robotStatus.isRunning ? "Stop Penyiraman" : "Start Penyiraman"}
              </button>
            </div>

            {/* Notifikasi Card */}
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src={imgMdiBellNotificationOutline}
                  alt="Bell"
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
                <h2 className="font-bold text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Notifikasi
                </h2>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'penyiraman' as const, label: 'Notifikasi Penyiraman' },
                  { key: 'suhuEkstrem' as const, label: 'Notifikasi Suhu Ekstrem' },
                  { key: 'kelembapanEkstrem' as const, label: 'Notifikasi Kelembapan Ekstrem' },
                  { key: 'stokMenipis' as const, label: 'Notifikasi Stok Menipis' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {item.label}
                    </span>
                    <div 
                      className="w-5 h-5 flex items-center justify-center cursor-pointer" 
                      onClick={() => handleNotificationChange(item.key)}
                    >
                      {notifications[item.key] ? (
                        <Image
                          src={imgMaterialIconThemeTodo}
                          alt="Checked"
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-5 h-5 border-2 border-[#9e1c60] rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Riwayat Pembelian */}
          <div className="rounded-[15px] p-4 shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h2 className="font-bold text-black mb-4" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Riwayat Pembelian
            </h2>
            <div className="space-y-3">
              {riwayatPembelian.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-[5px] hover:bg-gray-50 transition-colors"
                >
                  {/* Foto Produk */}
                  <div className="flex-shrink-0 w-[60px] h-[40px] flex items-center justify-center">
                    <Image
                      src={item.foto}
                      alt={item.namaProduk}
                      width={60}
                      height={40}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </div>
                  
                  {/* Info Produk */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black mb-1 truncate" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {item.namaProduk}
                    </p>
                    <p className="text-black" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      {item.jumlah} item • {item.totalHarga} • {item.tanggalPembelian}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex-shrink-0 flex flex-col gap-1 items-end">
                    <div
                      className="rounded-[10px] px-2 py-1 h-[24px] flex items-center justify-center"
                      style={{
                        backgroundColor: getStatusPembayaranColor(item.statusPembayaran),
                        fontSize: '10px',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.statusPembayaran}
                    </div>
                    <div
                      className="rounded-[10px] px-2 py-1 h-[24px] flex items-center justify-center"
                      style={{
                        backgroundColor: getStatusPengirimanColor(item.statusPengiriman),
                        fontSize: '10px',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.statusPengiriman}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pengaturan Umum */}
          <div className="rounded-[15px] p-4 shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Pengaturan Umum
              </h2>
              <button
                onClick={() => setIsProfilModalOpen(true)}
                className="bg-[#9e1c60] h-[42px] px-6 rounded-[10px] text-white font-bold hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
                Lihat Profil Akun
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-[11px]">
                <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Bahasa
                </label>
                <select
                  value={generalSettings.bahasa}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, bahasa: e.target.value })}
                  className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex flex-col gap-[11px]">
                <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Tema
                </label>
                <select
                  value={generalSettings.tema}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, tema: e.target.value })}
                  className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                >
                  <option value="light">Terang</option>
                  <option value="dark">Gelap</option>
                </select>
              </div>
            </div>

            {/* Hapus Akun */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-black mb-1" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Hapus Akun
                  </h3>
                  <p className="text-black" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Menghapus akun akan menghapus semua data Anda secara permanen
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="bg-red-600 h-[35px] px-6 rounded-[5px] text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                >
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>

          {/* Pengaturan Toko Section */}
          <div className="rounded-[15px] p-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h2 className="font-bold text-black mb-4" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Pengaturan Toko
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-6 mb-4">
                {/* Store Image */}
                <div className="flex-shrink-0 relative">
                  <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#9e1c60]">
                    <Image
                      src={storeImage}
                      alt="Store"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={storeImageInputRef}
                      onChange={handleStoreImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {/* Edit Icon - Outside the circle */}
                  <div 
                    onClick={handleStoreImageClick}
                    className="absolute bottom-0 right-0 w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0] transition-colors border-2 border-gray-300 shadow-lg z-10"
                    style={{ transform: 'translate(8px, 8px)' }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        fill="#000000"
                        stroke="#000000"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                </div>

                {/* Form Fields - Right Side */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Toko */}
                  <div className="flex flex-col gap-[11px]">
                    <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      value={formData.namaToko}
                      onChange={(e) => setFormData({ ...formData, namaToko: e.target.value })}
                      className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black"
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                      required
                    />
                  </div>

                  {/* Nomor HP */}
                  <div className="flex flex-col gap-[11px]">
                    <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Nomor HP
                    </label>
                    <input
                      type="text"
                      value={formData.nomorHP}
                      onChange={(e) => setFormData({ ...formData, nomorHP: e.target.value })}
                      className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black"
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="flex flex-col gap-[11px] mb-4">
                <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={formData.alamatLengkap}
                  onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
                  className="bg-[#f5f5f5] h-[35px] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] text-black"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                  required
                />
              </div>

              {/* Deskripsi Toko */}
              <div className="flex flex-col gap-[11px] mb-4">
                <label className="font-bold text-black" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Deskripsi Toko
                </label>
                <textarea
                  value={formData.deskripsiToko}
                  onChange={(e) => setFormData({ ...formData, deskripsiToko: e.target.value })}
                  rows={4}
                  className="bg-[#f5f5f5] px-3 py-2 rounded-[5px] outline-none focus:ring-2 focus:ring-[#9e1c60] resize-none text-black"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}
                  required
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#27a73d] h-[35px] px-6 rounded-[5px] text-white font-bold hover:bg-[#1f8a31] transition-colors disabled:opacity-50 flex items-center justify-center"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Data Toko"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowDeleteAccountModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div
            className="rounded-[15px] p-6 max-w-md w-full mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            <h3 className="font-bold text-black mb-4" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Hapus Akun
            </h3>
            <p className="text-black mb-6" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan dihapus secara permanen.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="bg-[#e09028] h-[35px] px-6 rounded-[5px] text-white font-bold hover:bg-[#c77a1f] transition-colors flex items-center justify-center"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 h-[35px] px-6 rounded-[5px] text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profil Modal */}
      <ProfilModal
        isOpen={isProfilModalOpen}
        onClose={() => setIsProfilModalOpen(false)}
      />
    </div>
  );
}
