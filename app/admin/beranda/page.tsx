"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminHeader from "@/app/components/AdminHeader";
import { supabase } from "@/utils/supabaseClient";
import { SkeletonCard, SkeletonActivity } from "@/app/components/SkeletonAdmin";

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
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        loadUserData(),
        loadStatistics(),
        loadRecentActivities()
      ]);
      setIsLoading(false);
    };

    fetchData();

    const handleRefresh = () => {
      setIsLoading(true);
      fetchData();
    };

    window.addEventListener('refresh-admin-data', handleRefresh);
    return () => window.removeEventListener('refresh-admin-data', handleRefresh);
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch full_name from users table first
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const name = userData?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          "Admin";
        setAdminName(name);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Fetch user statistics
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("role");

      if (usersError) throw usersError;

      const petani = users?.filter(u => u.role === "petani").length || 0;
      const pembeli = users?.filter(u => u.role === "pembeli").length || 0;

      // Fetch product count
      let productCount = 0;
      try {
        const { count } = await supabase
          .from("produk")
          .select("*", { count: "exact", head: true });
        productCount = count || 0;
      } catch (e) {
        // Silent fail
      }

      // Fetch transaction count (if transactions table exists)
      let transactionCount = 0;
      try {
        const { count } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });
        transactionCount = count || 0;
      } catch (e) {
        // Silent fail
      }

      // Fetch system count (if systems table exists)
      let systemCount = 0;
      try {
        const { count } = await supabase
          .from("systems")
          .select("*", { count: "exact", head: true });
        systemCount = count || 0;
      } catch (e) {
        // Silent fail
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
    <div className="rounded-[15px] p-5 relative shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-gray-600 mb-1" style={{ fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>{title}</p>
          <p className="font-bold text-black" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif', color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8" style={{ paddingLeft: '10px' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl text-black">Beranda</h1>
            <p className="text-sm text-black mt-1">Dashboard Admin</p>
          </div>
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : (
              <AdminHeader />
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Welcome Banner Skeleton */}
          <div className="mb-6 h-40 bg-gray-200 rounded-[15px] animate-pulse"></div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="rounded-[15px] p-6 shadow-lg bg-white border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Welcome Banner */}
          <div
            className="mb-6 relative rounded-[15px] overflow-visible"
            style={{
              background: 'linear-gradient(135deg, #fceef5 0%, #f5d8e5 25%, #eed2e1 50%, #e6c4d2 75%, #ddb5c3 100%)',
              border: '2px solid #9e1c60',
              boxShadow: '0 4px 12px rgba(158, 28, 96, 0.3), 0 2px 4px rgba(158, 28, 96, 0.2)'
            }}
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                {/* Text Content */}
                <div className="flex-1">
                  <h2 className="font-bold text-black mb-2" style={{ fontSize: '28px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Selamat Datang, {adminName}!
                  </h2>
                  <p className="text-black" style={{ fontSize: '16px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    Kelola sistem Siramify dengan mudah dan efisien
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Petani" value={statistics.totalPetani} />
            <StatCard title="Total Pembeli" value={statistics.totalPembeli} />
            <StatCard title="Total User" value={statistics.totalUser} />
            <StatCard title="Total Produk" value={statistics.totalProduk} />
            <StatCard title="Total Transaksi" value={statistics.totalTransaksi} />
            <StatCard title="Total Sistem" value={statistics.totalSistem} />
          </div>

          {/* Recent Activities */}
          <div className="rounded-[15px] p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f8 40%, #f5e8f0 80%, #f0d9e8 100%)', border: '1px solid rgba(158, 28, 96, 0.25)' }}>
            <h2 className="font-bold text-lg text-black mb-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>Aktivitas Terbaru</h2>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-[#9e1c60]/10 hover:bg-white transition-colors">
                    <div className="w-2 h-2 bg-[#9e1c60] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-black font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
