"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import LandingPageContent from "./components/LandingPageContent";

export default function Page() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (userData) {
            setUserRole((userData.role || "").toLowerCase());
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      router.push("/admin/beranda");
    } else if (userRole === "petani") {
      router.push("/petani/beranda");
    }
  }, [userRole, router]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9e1c60]"></div>
      </div>
    );
  }

  // Only render Landing Page if role is determined and not admin/petani
  if (userRole && userRole !== "admin" && userRole !== "petani") {
    return <LandingPageContent />;
  }

  // Also render Landing Page if no user (guest)
  if (!userRole) {
    return <LandingPageContent />;
  }

  return null; // While redirecting
}
