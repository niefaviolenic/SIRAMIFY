"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import Toast from "@/app/components/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      setToast({ message: event.detail.message, type: event.detail.type });
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    return () => window.removeEventListener('show-toast', handleShowToast as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#fef7f5]">
      <AdminSidebar />
      <div className="ml-[200px] min-h-screen bg-[#fef7f5]">
        {children}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
