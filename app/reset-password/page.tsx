"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const imgLogo1 = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Cek apakah ada hash di URL (dari email reset)
    const hash = window.location.hash;
    if (hash) {
      // Supabase akan handle hash untuk reset password
      console.log("Reset password hash detected");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password dan Konfirmasi Password tidak sama!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    setIsLoading(true);
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      alert("Password berhasil diubah! Silakan login dengan password baru.");
      router.push("/masuk");
    } catch (error: any) {
      console.error("Reset password error:", error);
      alert(error.message || "Gagal mengubah password. Link mungkin sudah kadaluarsa. Silakan request reset password lagi.");
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

          {/* Reset Password Form Card */}
          <div className="w-full md:w-[340px] bg-[#eed2e1] border-2 border-[#9e1c60] rounded-[8px] p-4 shadow-lg">
            <h2 className="font-bold text-base md:text-lg text-[#561530] mb-3 md:mb-4">
              Reset Password
            </h2>
            <p className="text-xs text-[#561530] mb-4 md:mb-5">
              Masukkan password baru Anda.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 md:gap-3">
              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan Password Baru"
                    className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561530] hover:opacity-70 transition cursor-pointer"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-xs text-[#561530]">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Masukkan Konfirmasi Password"
                    className="bg-[#f5f5f5] h-[38px] md:h-[40px] px-3 pr-10 py-2 rounded-[10px] w-full font-normal text-xs text-black/50 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#9e1c60]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561530] hover:opacity-70 transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#9e1c60] hover:bg-[#811844] transition text-white font-bold text-xs py-2 md:py-2.5 px-4 md:px-5 rounded-[10px] mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Mengubah..." : "Ubah Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
