"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";

interface TransactionItem {
  id: string;
  quantity: number;
  price: number;
  produk: {
    id: string;
    nama: string;
    foto: string | null;
  };
}

interface Transaction {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  transaction_items: TransactionItem[];
}

export default function PesananPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/masuk');
          return;
        }

        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            transaction_items (
              id,
              quantity,
              price,
              produk:produk_id (
                id,
                nama,
                foto
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedTransactions = data.map((t: any) => ({
            ...t,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction_items: t.transaction_items.map((item: any) => ({
              ...item,
              produk: Array.isArray(item.produk) ? item.produk[0] : item.produk
            }))
          }));
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9e1c60]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1000px] mx-auto w-full flex-1">
        <h1 className="font-bold text-[#561530] text-2xl md:text-3xl mb-8">Daftar Pesanan</h1>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Belum ada pesanan.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-[#9e1c60] text-white rounded-full font-bold hover:bg-[#811844] transition-all"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-100 pb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Pesanan</p>
                    <p className="font-bold text-[#561530]">{formatDate(transaction.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${transaction.status === 'selesai' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {transaction.status}
                    </span>
                    <p className="text-sm text-gray-500">ID: {transaction.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {transaction.transaction_items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.produk.foto ? (
                          <Image
                            src={item.produk.foto}
                            alt={item.produk.nama}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#561530]">{item.produk.nama}</h3>
                        <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#9e1c60]">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-[#561530]">Total Pesanan</span>
                  <span className="font-bold text-xl text-[#9e1c60]">{formatCurrency(transaction.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
