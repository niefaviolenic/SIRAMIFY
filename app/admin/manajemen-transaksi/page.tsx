"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/app/components/AdminHeader";
import { supabase } from "@/utils/supabaseClient";

interface TransactionItem {
  id: string;
  quantity: number;
  price: number;
  produk: {
    nama: string;
  };
  petani: {
    full_name: string;
    email: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "selesai" | "dibatalkan";
  created_at: string;
  pembeli: {
    full_name: string;
    email: string;
  };
  items: TransactionItem[];
}

export default function ManajemenTransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, statusFilter, transactions]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          pembeli:users!transactions_user_id_fkey(full_name, email),
          items:transaction_items(
            id,
            quantity,
            price,
            produk:produk_id(nama),
            petani:users!transaction_items_petani_id_fkey(full_name, email)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Map data to ensure correct types
        const mappedData = data.map((tx: any) => ({
          ...tx,
          pembeli: Array.isArray(tx.pembeli) ? tx.pembeli[0] : tx.pembeli,
          items: tx.items.map((item: any) => ({
            ...item,
            produk: Array.isArray(item.produk) ? item.produk[0] : item.produk,
            petani: Array.isArray(item.petani) ? item.petani[0] : item.petani,
          }))
        }));
        setTransactions(mappedData);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.id.toLowerCase().includes(query) ||
          (tx.pembeli?.full_name && tx.pembeli.full_name.toLowerCase().includes(query)) ||
          (tx.pembeli?.email && tx.pembeli.email.toLowerCase().includes(query)) ||
          tx.items.some(item => item.produk?.nama.toLowerCase().includes(query)) ||
          tx.items.some(item => item.petani?.full_name.toLowerCase().includes(query))
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleUpdateStatus = async (transaction: Transaction, newStatus: "pending" | "selesai" | "dibatalkan") => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", transaction.id);

      if (error) throw error;

      setTransactions(transactions.map(tx =>
        tx.id === transaction.id ? { ...tx, status: newStatus } : tx
      ));
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Gagal mengupdate status transaksi. Silakan coba lagi.");
    }
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selesai":
        return "#106113";
      case "pending":
        return "#ff9500";
      case "dibatalkan":
        return "#ba0b0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-8" style={{ paddingLeft: '10px' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-bold text-2xl text-black">Manajemen Transaksi</h1>
              <p className="text-xs text-black mt-1">Kelola semua transaksi</p>
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
              placeholder="Cari transaksi (ID, pembeli, petani, produk)..."
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
              <option value="pending">Pending</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-gray-100 h-10 w-full animate-pulse rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-[#9e1c60] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#9e1c60] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold">ID Transaksi</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Pembeli</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Total Item</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Total Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Tanggal</th>
                    <th className="px-4 py-3 text-center text-xs font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Tidak ada transaksi ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-black">#{transaction.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-black">
                          <div className="font-bold">{transaction.pembeli?.full_name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{transaction.pembeli?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">
                          {transaction.items.reduce((acc, item) => acc + item.quantity, 0)} item
                        </td>
                        <td className="px-4 py-3 text-sm text-black">{formatCurrency(transaction.total_amount)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={transaction.status}
                            onChange={(e) => handleUpdateStatus(transaction, e.target.value as "pending" | "selesai" | "dibatalkan")}
                            className="px-3 py-1 rounded-[10px] text-xs font-bold text-white border-0 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                            style={{ backgroundColor: getStatusColor(transaction.status) }}
                          >
                            <option value="pending">Pending</option>
                            <option value="selesai">Selesai</option>
                            <option value="dibatalkan">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(transaction.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleViewDetail(transaction)}
                              className="px-3 py-1 text-xs text-[#9e1c60] hover:bg-gray-200 rounded transition cursor-pointer"
                            >
                              Detail
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


      {/* Detail Modal */}
      {
        showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-black">Detail Transaksi</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-sm text-gray-500 mb-2">Informasi Transaksi</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">ID:</span> #{selectedTransaction.id}</p>
                    <p className="text-sm"><span className="font-medium">Tanggal:</span> {formatDate(selectedTransaction.created_at)}</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> <span className="capitalize" style={{ color: getStatusColor(selectedTransaction.status) }}>{selectedTransaction.status}</span></p>
                    <p className="text-sm"><span className="font-medium">Total:</span> {formatCurrency(selectedTransaction.total_amount)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500 mb-2">Informasi Pembeli</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Nama:</span> {selectedTransaction.pembeli?.full_name || "Unknown"}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedTransaction.pembeli?.email || "-"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-500 mb-3">Daftar Produk</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Produk</th>
                        <th className="px-4 py-2 text-left">Petani</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Harga</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedTransaction.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{item.produk?.nama || "Unknown Product"}</td>
                          <td className="px-4 py-2">{item.petani?.full_name || "Unknown"}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-[#9e1c60] rounded-lg text-sm font-bold text-white hover:bg-[#7a1548] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
