"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/app/components/AdminSidebar";
import AdminHeader from "@/app/components/AdminHeader";
import { supabase } from "@/utils/supabaseClient";

export default function AdminBerandaPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState({
    totalPetani: 0,
    totalPembeli: 0,
    totalUser: 0,
    totalProduk: 0,
    totalTransaksi: 0,
    totalSistem: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
    loadRecentActivities();
  }, []);

  const loadStatistics = async () => {
    try {
      // Fetch user statistics
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("role");

      if (usersError) throw usersError;

      const petani = users?.filter(u => u.role === "petani").length || 0;
      const pembeli = users?.filter(u => u.role === "pembeli").length || 0;

      // Fetch product count (if products table exists)
      let productCount = 0;
      try {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });
        productCount = count || 0;
      } catch (e) {
        console.log("Products table might not exist yet");
      }

      // Fetch transaction count (if transactions table exists)
      let transactionCount = 0;
      try {
        const { count } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });
        transactionCount = count || 0;
      } catch (e) {
        console.log("Transactions table might not exist yet");
      }

      // Fetch system count (if systems table exists)
      let systemCount = 0;
      try {
        const { count } = await supabase
          .from("systems")
          .select("*", { count: "exact", head: true });
        systemCount = count || 0;
      } catch (e) {
        console.log("Systems table might not exist yet");
      }

      setStatistics({
        totalPetani: petani,
        totalPembeli: pembeli,
        totalUser: (users?.length || 0),
        totalProduk: productCount,
        totalTransaksi: transactionCount,
        totalSistem: systemCount,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
      // Set mock data if there's an error
      setStatistics({
        totalPetani: 12,
        totalPembeli: 45,
        totalUser: 59,
        totalProduk: 23,
        totalTransaksi: 156,
        totalSistem: 8,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Fetch recent user registrations
      const { data: recentUsers } = await supabase
        .from("users")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentUsers) {
        const activities = recentUsers.map(user => ({
          type: "user_registered",
          message: `User baru dengan role ${user.role} terdaftar: ${user.email}`,
          timestamp: new Date(user.created_at).toLocaleString("id-ID"),
        }));
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error("Error loading recent activities:", error);
      // Mock data
      setRecentActivities([
        { type: "user_registered", message: "User baru dengan role petani terdaftar: petani1@example.com", timestamp: "21 Jan 2025, 10:30" },
        { type: "transaction", message: "Transaksi baru: #TRX001", timestamp: "21 Jan 2025, 09:15" },
        { type: "system", message: "Sistem baru ditambahkan: Robot #5", timestamp: "20 Jan 2025, 16:45" },
      ]);
    }
  };

  const StatCard = ({ title, value, color = "#9e1c60" }: { title: string; value: number | string; color?: string }) => (
    <div className="border border-[#9e1c60] rounded-[10px] p-4 bg-white">
      <p className="text-black mb-2" style={{ fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {title}
      </p>
      <p className="font-bold text-black" style={{ fontSize: '20px', fontFamily: 'Arial, Helvetica, sans-serif', color }}>
        {value}
      </p>
    </div>
  );

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
                <h1 className="font-bold text-2xl text-black">Beranda</h1>
                <p className="text-xs text-black mt-1">Dashboard Admin</p>
              </div>
              <div className="flex-shrink-0">
                <AdminHeader />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Petani" value={statistics.totalPetani} />
            <StatCard title="Total Pembeli" value={statistics.totalPembeli} />
            <StatCard title="Total User" value={statistics.totalUser} />
            <StatCard title="Total Produk" value={statistics.totalProduk} />
            <StatCard title="Total Transaksi" value={statistics.totalTransaksi} />
            <StatCard title="Total Sistem" value={statistics.totalSistem} />
          </div>

          {/* Recent Activities */}
          <div className="border border-[#9e1c60] rounded-[10px] p-6 bg-white">
            <h2 className="font-bold text-lg text-black mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-gray-500">Memuat aktivitas...</p>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#9e1c60] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-black">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

