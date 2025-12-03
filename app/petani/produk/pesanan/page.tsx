"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";

const imgMaterialSymbolsDeleteRounded = "https://www.figma.com/api/mcp/asset/3a755e67-d3d6-4f8d-82c3-815abf7e841a";

interface Order {
  id: string;
  no: number;
  tanggalPesanan: string;
  namaPembeli: string;
  pembeliId?: string;
  produk: {
    nama: string;
    foto: string;
  };
  jumlah: number;
  totalHarga: string;
  statusPembayaran: "Belum Bayar" | "Sudah Bayar" | "Dikembalikan";
  statusPengiriman: "Belum Dikirim" | "Pengemasan" | "Dikirim";
  rating?: number; // 1-5
  ratingComment?: string;
  chatMessages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isPetani: boolean;
  }>;
}

export default function PesananPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: Fetch orders from Supabase
    // For now, using mock data
    const mockOrders: Order[] = [
      {
        id: "1",
        no: 1,
        tanggalPesanan: "15 Jan 2024",
        namaPembeli: "Budi Santoso",
        pembeliId: "pembeli1",
        produk: {
          nama: "Benih Selada Merah",
          foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
        },
        jumlah: 2,
        totalHarga: "Rp14.000",
        statusPembayaran: "Sudah Bayar",
        statusPengiriman: "Dikirim",
        rating: 5,
        ratingComment: "Produk sangat bagus dan sesuai dengan deskripsi. Terima kasih!",
        chatMessages: [
          {
            id: "msg1",
            senderId: "pembeli1",
            senderName: "Budi Santoso",
            message: "Halo, kapan produknya dikirim?",
            timestamp: "15 Jan 2024, 10:00",
            isPetani: false,
          },
          {
            id: "msg2",
            senderId: "petani1",
            senderName: "Petani",
            message: "Halo, produk akan dikirim hari ini juga.",
            timestamp: "15 Jan 2024, 10:15",
            isPetani: true,
          },
        ],
      },
      {
        id: "2",
        no: 2,
        tanggalPesanan: "14 Jan 2024",
        namaPembeli: "Siti Nurhaliza",
        pembeliId: "pembeli2",
        produk: {
          nama: "Selada Oakloaf Merah",
          foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
        },
        jumlah: 1,
        totalHarga: "Rp32.000",
        statusPembayaran: "Sudah Bayar",
        statusPengiriman: "Dikirim",
        chatMessages: [
          {
            id: "msg3",
            senderId: "pembeli2",
            senderName: "Siti Nurhaliza",
            message: "Apakah produknya masih segar?",
            timestamp: "14 Jan 2024, 09:00",
            isPetani: false,
          },
        ],
      },
      {
        id: "3",
        no: 3,
        tanggalPesanan: "13 Jan 2024",
        namaPembeli: "Ahmad Dahlan",
        pembeliId: "pembeli3",
        produk: {
          nama: "Pupuk Organik",
          foto: "https://www.figma.com/api/mcp/asset/8c1614d4-747c-47ce-baf8-be35bd3ba6de",
        },
        jumlah: 3,
        totalHarga: "Rp291.000",
        statusPembayaran: "Belum Bayar",
        statusPengiriman: "Belum Dikirim",
      },
      {
        id: "4",
        no: 4,
        tanggalPesanan: "12 Jan 2024",
        namaPembeli: "Dewi Sartika",
        pembeliId: "pembeli4",
        produk: {
          nama: "Benih Selada Merah",
          foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
        },
        jumlah: 5,
        totalHarga: "Rp35.000",
        statusPembayaran: "Sudah Bayar",
        statusPengiriman: "Pengemasan",
      },
      {
        id: "5",
        no: 5,
        tanggalPesanan: "11 Jan 2024",
        namaPembeli: "Raden Ajeng Kartini",
        pembeliId: "pembeli5",
        produk: {
          nama: "Selada Oakloaf Merah",
          foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
        },
        jumlah: 2,
        totalHarga: "Rp64.000",
        statusPembayaran: "Dikembalikan",
        statusPengiriman: "Belum Dikirim",
      },
    ];

    setOrders(mockOrders);
    setIsLoading(false);
  }, []);

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
      case "Dikirim":
        return "#106113"; // hijau
      case "Pengemasan":
        return "#ff9500"; // kuning
      case "Belum Dikirim":
        return "#dc2626"; // merah
      default:
        return "#6b7280";
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: "Belum Dikirim" | "Pengemasan" | "Dikirim") => {
    // TODO: Update status pengiriman di Supabase
    console.log("Update status pengiriman:", orderId, newStatus);
    
    // Update local state untuk preview
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, statusPengiriman: newStatus }
        : order
    ));
  };

  const handleOpenChat = (order: Order) => {
    setSelectedOrder(order);
    setShowChatModal(true);
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleOpenDelete = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    if (!selectedOrder) return;
    
    setOrders(orders.filter(order => order.id !== selectedOrder.id));
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  const handleSendChat = () => {
    if (!selectedOrder || !newChatMessage.trim()) return;
    
    // TODO: Send chat message to Supabase
    const newMessage = {
      id: `msg${Date.now()}`,
      senderId: "petani1",
      senderName: "Petani",
      message: newChatMessage.trim(),
      timestamp: new Date().toLocaleString('id-ID'),
      isPetani: true,
    };
    
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? { 
            ...order, 
            chatMessages: [...(order.chatMessages || []), newMessage]
          }
        : order
    );
    
    setOrders(updatedOrders);
    
    // Update selectedOrder untuk refresh modal
    const updatedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
    if (updatedOrder) {
      setSelectedOrder(updatedOrder);
    }
    
    setNewChatMessage("");
  };

  return (
    <div className="min-h-screen bg-white flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] min-h-screen bg-white" style={{ minHeight: '100vh', width: 'calc(100% - 180px)', paddingBottom: '40px' }}>
        <div className="p-8" style={{ paddingLeft: '10px', minHeight: '100%' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-3xl text-black">Produk</h1>
                <p className="text-sm text-black mt-1">Produk/Pesanan</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <div className="mb-4">
            <button
              onClick={() => router.push("/petani/produk")}
              className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] hover:shadow-md transition-all duration-200 flex items-center gap-2"
              style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ strokeWidth: '1.5' }}
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Kembali ke Produk
            </button>
          </div>

          {/* Card Statistik Pesanan */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Total Pesanan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {orders.length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Belum Dikirim
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {orders.filter(o => o.statusPengiriman === "Belum Dikirim").length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Sedang Dikirim
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {orders.filter(o => o.statusPengiriman === "Pengemasan" || o.statusPengiriman === "Dikirim").length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Dikirim
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {orders.filter(o => o.statusPengiriman === "Dikirim").length}
              </p>
            </div>
            <div className="rounded-[15px] p-4 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
              <p className="text-black mb-2" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Dikembalikan
              </p>
              <p className="font-bold text-black" style={{ fontSize: '24px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {orders.filter(o => o.statusPembayaran === "Dikembalikan").length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[15px] overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#eed2e1] h-[40px]">
                    <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '14px' }}>
                      No
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Tanggal Pesanan
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Nama Pembeli
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[200px]" style={{ fontSize: '14px' }}>
                      Produk
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[80px]" style={{ fontSize: '14px' }}>
                      Jumlah
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Total Harga
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Status Pembayaran
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Status Pengiriman
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '14px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)' }}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="h-[50px] border-b border-[#9e1c60]/15 last:border-b-0 transition"
                        style={{ 
                          background: 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #faf5f8 0%, #f5e8f0 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to bottom, #ffffff 0%, #faf8fb 100%)';
                        }}
                      >
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{order.no}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{order.tanggalPesanan}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{order.namaPembeli}</p>
                        </td>
                        <td className="px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-[40px] h-[30px] flex items-center justify-center flex-shrink-0">
                              <Image
                                src={order.produk.foto}
                                alt={order.produk.nama}
                                width={40}
                                height={30}
                                className="max-w-full max-h-full object-contain"
                                unoptimized
                              />
                            </div>
                            <p className="text-[#181818] truncate" style={{ fontSize: '12px' }}>{order.produk.nama}</p>
                          </div>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{order.jumlah}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '12px' }}>{order.totalHarga}</p>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className="rounded-[10px] px-2 py-1 h-[24px] flex items-center justify-center"
                              style={{
                                backgroundColor: getStatusPembayaranColor(order.statusPembayaran),
                                fontSize: '12px',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {order.statusPembayaran}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="relative inline-block">
                              <select
                                value={order.statusPengiriman}
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value as "Belum Dikirim" | "Pengemasan" | "Dikirim")}
                                onMouseDown={(e) => {
                                  const isOpen = openDropdowns.has(order.id);
                                  if (isOpen) {
                                    // Jika sudah terbuka, tutup
                                    setOpenDropdowns(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(order.id);
                                      return newSet;
                                    });
                                  } else {
                                    // Jika tertutup, buka
                                    setOpenDropdowns(prev => new Set(prev).add(order.id));
                                  }
                                }}
                                onBlur={() => {
                                  // Reset ke tertutup saat blur
                                  setOpenDropdowns(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(order.id);
                                    return newSet;
                                  });
                                }}
                                className="rounded-[10px] pl-2 pr-5 py-1 h-[24px] text-center cursor-pointer transition-colors border-none outline-none appearance-none"
                                style={{ 
                                  fontSize: '12px', 
                                  fontFamily: 'Arial, Helvetica, sans-serif',
                                  minWidth: '120px',
                                  backgroundColor: getStatusPengirimanColor(order.statusPengiriman),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  paddingRight: '18px'
                                }}
                              >
                                <option value="Belum Dikirim" style={{ backgroundColor: '#dc2626', color: 'white' }}>Belum Dikirim</option>
                                <option value="Pengemasan" style={{ backgroundColor: '#ff9500', color: 'white' }}>Pengemasan</option>
                                <option value="Dikirim" style={{ backgroundColor: '#106113', color: 'white' }}>Dikirim</option>
                              </select>
                              <div 
                                className="absolute right-2 top-1/2 pointer-events-none transition-transform duration-200"
                                style={{
                                  transform: openDropdowns.has(order.id) 
                                    ? 'translateY(-50%) rotate(180deg)' 
                                    : 'translateY(-50%) rotate(0deg)'
                                }}
                              >
                                <svg 
                                  width="10" 
                                  height="10" 
                                  viewBox="0 0 12 12" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path 
                                    d="M3 4.5L6 7.5L9 4.5" 
                                    stroke="white" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Chat Icon */}
                            <button
                              onClick={() => handleOpenChat(order)}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Chat"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#9e1c60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            
                            {/* Rating Icon */}
                            <button
                              onClick={() => handleOpenDetail(order)}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Lihat Detail & Rating"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ff9500" stroke="#ff9500" strokeWidth="1"/>
                              </svg>
                            </button>
                            
                            {/* Delete Icon */}
                            <button
                              onClick={() => handleOpenDelete(order)}
                              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Hapus Pesanan"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#dc2626"/>
                              </svg>
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

      {/* Modal Detail Pesanan */}
      {showDetailModal && selectedOrder && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 py-8"
          onClick={() => setShowDetailModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div 
            className="rounded-[15px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-2xl text-black">Detail Pesanan</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#181818" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Info Pesanan */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal Pesanan</p>
                  <p className="text-base font-semibold text-black">{selectedOrder.tanggalPesanan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nama Pembeli</p>
                  <p className="text-base font-semibold text-black">{selectedOrder.namaPembeli}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Produk</p>
                  <p className="text-base font-semibold text-black">{selectedOrder.produk.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jumlah</p>
                  <p className="text-base font-semibold text-black">{selectedOrder.jumlah}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                  <p className="text-base font-semibold text-black">{selectedOrder.totalHarga}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Pembayaran</p>
                  <div
                    className="inline-flex rounded-[10px] px-2 py-1 h-[24px] items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: getStatusPembayaranColor(selectedOrder.statusPembayaran) }}
                  >
                    {selectedOrder.statusPembayaran}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Pengiriman</p>
                  <div
                    className="inline-flex rounded-[10px] px-2 py-1 h-[24px] items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: getStatusPengirimanColor(selectedOrder.statusPengiriman) }}
                  >
                    {selectedOrder.statusPengiriman}
                  </div>
                </div>
              </div>
            </div>

            {/* Penilaian dari Pembeli */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-black mb-3">Penilaian</h3>
              {selectedOrder.rating ? (
                <div className="p-4 bg-yellow-50 rounded-[10px] border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={star <= selectedOrder.rating! ? "#ff9500" : "#e5e7eb"}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-base font-semibold text-black">{selectedOrder.rating}/5</span>
                  </div>
                  {selectedOrder.ratingComment && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Kritik & Saran:</p>
                      <p className="text-base text-gray-700">{selectedOrder.ratingComment}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                  <p className="text-base text-gray-500 text-center">Belum ada penilaian dari pembeli</p>
                </div>
              )}
            </div>

            {/* Chat History */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Riwayat Chat</p>
              <div className="border border-gray-200 rounded-[10px] p-4 max-h-60 overflow-y-auto space-y-3">
                {selectedOrder.chatMessages && selectedOrder.chatMessages.length > 0 ? (
                  selectedOrder.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isPetani ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-[10px] p-3 ${
                          msg.isPetani 
                            ? 'bg-[#9e1c60] text-white' 
                            : 'bg-gray-100 text-black'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                        <p className="text-base">{msg.message}</p>
                        <p className="text-sm mt-1 opacity-70">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-gray-500 text-center">Belum ada chat</p>
                )}
              </div>
            </div>

            {/* Input Chat Baru */}
            <div className="flex gap-2">
              <textarea
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 border border-gray-300 rounded-[10px] px-3 py-2 text-base resize-none"
                rows={2}
              />
              <button
                onClick={handleSendChat}
                disabled={!newChatMessage.trim()}
                className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '12px' }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chat */}
      {showChatModal && selectedOrder && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 py-8"
          onClick={() => setShowChatModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div 
            className="rounded-[15px] p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-xl text-black">Chat dengan {selectedOrder.namaPembeli}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.produk.nama}</p>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#181818" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 border border-gray-200 rounded-[10px] p-4 mb-4 overflow-y-auto space-y-3">
              {selectedOrder.chatMessages && selectedOrder.chatMessages.length > 0 ? (
                selectedOrder.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isPetani ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-[10px] p-3 ${
                        msg.isPetani 
                          ? 'bg-[#9e1c60] text-white' 
                          : 'bg-gray-100 text-black'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                      <p className="text-base">{msg.message}</p>
                      <p className="text-sm mt-1 opacity-70">{msg.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">Belum ada chat</p>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <textarea
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 border border-gray-300 rounded-[10px] px-3 py-2 text-base resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={!newChatMessage.trim()}
                className="px-4 py-2 bg-[#9e1c60] text-white rounded-[10px] hover:bg-[#7d1650] transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '12px' }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Pesanan */}
      {showDeleteModal && selectedOrder && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 py-8"
          onClick={() => setShowDeleteModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
            fontFamily: 'Arial, Helvetica, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div 
            className="rounded-[15px] p-8 max-w-sm w-full mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-[#9e1c60] flex items-center justify-center bg-white">
                <span className="text-4xl text-[#9e1c60] font-bold leading-none">!</span>
              </div>
            </div>
            
            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-[#181818] text-lg font-normal leading-relaxed">
                Anda yakin ingin menghapus pesanan dari {selectedOrder.namaPembeli}?
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-[10px] bg-[#ff9500] text-white hover:bg-[#e68500] transition font-semibold"
                style={{ fontSize: '16px' }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 py-3 rounded-[10px] bg-[#dc2626] text-white hover:bg-[#b91c1c] transition font-semibold"
                style={{ fontSize: '16px' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

