"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PetaniSidebar from "@/app/components/PetaniSidebar";
import PetaniHeader from "@/app/components/PetaniHeader";
import Image from "next/image";

const imgIconamoonEditLight = "https://www.figma.com/api/mcp/asset/e12eaffa-ec34-4b35-ac23-8b0719bfdc0d";

interface Order {
  id: string;
  no: number;
  tanggalPesanan: string;
  namaPembeli: string;
  produk: {
    nama: string;
    foto: string;
  };
  jumlah: number;
  totalHarga: string;
  statusPembayaran: "Belum Bayar" | "Sudah Bayar" | "Refund";
  statusPengiriman: "Belum Dikirim" | "Pengemasan" | "Dikirim" | "Selesai";
}

export default function PesananPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch orders from Supabase
    // For now, using mock data
    const mockOrders: Order[] = [
      {
        id: "1",
        no: 1,
        tanggalPesanan: "15 Jan 2024",
        namaPembeli: "Budi Santoso",
        produk: {
          nama: "Benih Selada Merah",
          foto: "https://www.figma.com/api/mcp/asset/32b71d60-7912-4d47-9a8d-afbbe6983ef4",
        },
        jumlah: 2,
        totalHarga: "Rp14.000",
        statusPembayaran: "Sudah Bayar",
        statusPengiriman: "Selesai",
      },
      {
        id: "2",
        no: 2,
        tanggalPesanan: "14 Jan 2024",
        namaPembeli: "Siti Nurhaliza",
        produk: {
          nama: "Selada Oakloaf Merah",
          foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
        },
        jumlah: 1,
        totalHarga: "Rp32.000",
        statusPembayaran: "Sudah Bayar",
        statusPengiriman: "Dikirim",
      },
      {
        id: "3",
        no: 3,
        tanggalPesanan: "13 Jan 2024",
        namaPembeli: "Ahmad Dahlan",
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
        produk: {
          nama: "Selada Oakloaf Merah",
          foto: "https://www.figma.com/api/mcp/asset/fb9b784c-60e8-46f5-9cd9-c464126ca6c8",
        },
        jumlah: 2,
        totalHarga: "Rp64.000",
        statusPembayaran: "Refund",
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
        return "#ba0b0b";
      case "Refund":
        return "#ff9500";
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

  const handleEdit = (id: string) => {
    // TODO: Navigate to edit order page
    console.log("Edit order:", id);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <PetaniSidebar />

      {/* Main Content */}
      <div className="flex-3 ml-[200px] min-h-screen">
        <div className="p-8" style={{ paddingLeft: '10px' }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl text-black">Pesanan</h1>
                <p className="text-xs text-black mt-1">Pesanan</p>
              </div>
              <div className="flex-shrink-0">
                <PetaniHeader />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[10px] overflow-hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-[#eed2e1] h-[40px]">
                    <th className="px-4 text-center font-bold text-[#181818] w-[62px]" style={{ fontSize: '12px' }}>
                      No
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '12px' }}>
                      Tanggal Pesanan
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '12px' }}>
                      Nama Pembeli
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[150px]" style={{ fontSize: '12px' }}>
                      Produk
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[80px]" style={{ fontSize: '12px' }}>
                      Jumlah
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '12px' }}>
                      Total Harga
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '12px' }}>
                      Status Pembayaran
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[120px]" style={{ fontSize: '12px' }}>
                      Status Pengiriman
                    </th>
                    <th className="px-4 text-center font-bold text-[#181818] min-w-[100px]" style={{ fontSize: '12px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '10px' }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500" style={{ fontSize: '12px' }}>
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="h-[50px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{order.no}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{order.tanggalPesanan}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{order.namaPembeli}</p>
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
                            <p className="text-[#181818] truncate" style={{ fontSize: '10px' }}>{order.produk.nama}</p>
                          </div>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{order.jumlah}</p>
                        </td>
                        <td className="px-4 text-center">
                          <p className="text-[#181818]" style={{ fontSize: '10px' }}>{order.totalHarga}</p>
                        </td>
                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className="rounded-[5px] px-2 py-1"
                              style={{
                                backgroundColor: getStatusPembayaranColor(order.statusPembayaran),
                                fontSize: '10px',
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
                            <div
                              className="rounded-[5px] px-2 py-1"
                              style={{
                                backgroundColor: getStatusPengirimanColor(order.statusPengiriman),
                                fontSize: '10px',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {order.statusPengiriman}
                            </div>
                          </div>
                        </td>
                        <td className="px-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleEdit(order.id)}
                              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition cursor-pointer"
                              title="Edit"
                            >
                              <Image
                                src={imgIconamoonEditLight}
                                alt="Edit"
                                width={20}
                                height={20}
                                className="object-contain"
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
    </div>
  );
}

