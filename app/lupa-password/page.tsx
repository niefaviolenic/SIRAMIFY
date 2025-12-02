"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const imgLogo1 = "https://www.figma.com/api/mcp/asset/3777a01f-7248-4b92-81c8-28d8ce86e840";
const imgVector2 = "https://www.figma.com/api/mcp/asset/044ae3c8-2b69-4ea0-a2fc-094b22f6f72d";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert("Link reset password telah dikirim ke email Anda! Silakan cek inbox Anda.");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      alert(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 md:px-20 pt-24 md:pt-32 pb-16 md:pb-20">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
          {/* Logo Section */}
          <div className="hidden md:flex items-center justify-center w-full md:w-auto md:flex-1 max-w-[500px]">
            <div className="relative w-[300px] md:w-[403px] h-[80px] md:h-[104px]">
              <Image
                src={imgLogo1}
                alt="Siramify Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Forgot Password Form Card */}
          <div className="w-full md:w-[340px] bg-[#eed2e1] border-2 border-[#9e1c60] rounded-[8px] p-4 shadow-lg">
            <h2 className="font-bold text-base md:text-lg text-[#561530] mb-3 md:mb-4">
              Lupa Password
            </h2>
            <p className="text-xs text-[#561530] mb-4 md:mb-5">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 md:gap-3">
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="niefa@gmail.com"
                  className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#9e1c60] hover:bg-[#811844] transition text-white font-bold text-xs py-2 md:py-2.5 px-4 md:px-5 rounded-[10px] mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            {/* Back to Login Link */}
            <p className="text-center mt-3 md:mt-4 text-xs text-[#561530]">
              Ingat password Anda?{" "}
              <Link href="/masuk" className="font-bold hover:text-[#9e1c60] transition">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
