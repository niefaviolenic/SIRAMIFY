"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import ProfilModal from "./ProfilModal";

const imgLogo1 =
  "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfilModalOpen, setIsProfilModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      }
    };
    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    if (isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-3 left-4 right-4 z-50 bg-white backdrop-blur-md shadow-md rounded-2xl">
        <div className="max-w-[1100px] mx-auto px-4 py-1.5 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src={imgLogo1}
              alt="Siramify Logo"
              width={100}
              height={28}
              className="object-contain"
              unoptimized
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-[#561530] text-sm">
            <Link
              href={isLandingPage ? "#tentang-kami" : "/#tentang-kami"}
              onClick={(e) => handleScroll(e, "tentang-kami")}
              className="hover:text-[#9e1c60] transition-all cursor-pointer"
            >
              Tentang Kami
            </Link>
            <Link
              href={isLandingPage ? "#artikel" : "/#artikel"}
              onClick={(e) => handleScroll(e, "artikel")}
              className="hover:text-[#9e1c60] transition-all cursor-pointer"
            >
              Artikel
            </Link>
            <Link
              href={isLandingPage ? "#produk" : "/#produk"}
              onClick={(e) => handleScroll(e, "produk")}
              className="hover:text-[#9e1c60] transition-all cursor-pointer"
            >
              Produk
            </Link>
            <Link
              href={isLandingPage ? "#kontak" : "/#kontak"}
              onClick={(e) => handleScroll(e, "kontak")}
              className="hover:text-[#9e1c60] transition-all cursor-pointer"
            >
              Kontak
            </Link>
          </div>

          {/* DESKTOP LOGIN BUTTON / USER DROPDOWN */}
          {user && user.role === 'pembeli' ? (
            <div className="hidden md:relative md:flex items-center">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#9e1c60] font-bold text-sm hover:text-[#811844] transition-all cursor-pointer"
              >
                {user.full_name}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1 flex flex-col">
                  <Link
                    href="/keranjang"
                    className="px-4 py-2 text-sm text-[#561530] hover:bg-[#fcebf4] hover:text-[#9e1c60] text-left transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Keranjang
                  </Link>
                  <Link
                    href="/pesanan"
                    className="px-4 py-2 text-sm text-[#561530] hover:bg-[#fcebf4] hover:text-[#9e1c60] text-left transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Pesanan
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfilModalOpen(true);
                    }}
                    className="px-4 py-2 text-sm text-[#561530] hover:bg-[#fcebf4] hover:text-[#9e1c60] text-left transition-colors w-full cursor-pointer"
                  >
                    Akun
                  </button>
                  <div className="h-[1px] bg-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left transition-colors w-full cursor-pointer"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/masuk" className="hidden md:flex px-4 py-1.5 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all cursor-pointer">
              Masuk
            </Link>
          )}

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-7 h-7 flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out origin-center ${isMenuOpen
                ? "rotate-45 top-1/2 -translate-y-1/2"
                : "top-1.5"
                }`}
            ></span>
            <span
              className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100 top-1/2 -translate-y-1/2"
                }`}
            ></span>
            <span
              className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out origin-center ${isMenuOpen
                ? "-rotate-45 top-1/2 -translate-y-1/2"
                : "bottom-1.5"
                }`}
            ></span>
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md px-4 pb-4 pt-2 space-y-3 rounded-b-2xl">
            <Link
              href={isLandingPage ? "#tentang-kami" : "/#tentang-kami"}
              onClick={(e) => {
                handleScroll(e, "tentang-kami");
                setIsMenuOpen(false);
              }}
              className="block text-sm text-[#561530] hover:text-[#9e1c60]"
            >
              Tentang Kami
            </Link>
            <Link
              href={isLandingPage ? "#artikel" : "/#artikel"}
              onClick={(e) => {
                handleScroll(e, "artikel");
                setIsMenuOpen(false);
              }}
              className="block text-sm text-[#561530] hover:text-[#9e1c60] cursor-pointer"
            >
              Artikel
            </Link>
            <Link
              href={isLandingPage ? "#produk" : "/#produk"}
              onClick={(e) => {
                handleScroll(e, "produk");
                setIsMenuOpen(false);
              }}
              className="block text-sm text-[#561530] hover:text-[#9e1c60] cursor-pointer"
            >
              Produk
            </Link>
            <Link
              href={isLandingPage ? "#kontak" : "/#kontak"}
              onClick={(e) => {
                handleScroll(e, "kontak");
                setIsMenuOpen(false);
              }}
              className="block text-sm text-[#561530] hover:text-[#9e1c60] cursor-pointer"
            >
              Kontak
            </Link>

            {user && user.role === 'pembeli' ? (
              <div className="pt-2 border-t border-gray-100">
                <div className="font-bold text-[#9e1c60] text-sm mb-2 px-2">{user.full_name}</div>
                <Link
                  href="/keranjang"
                  className="block px-2 py-2 text-sm text-[#561530] hover:text-[#9e1c60]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Keranjang
                </Link>
                <Link
                  href="/pesanan"
                  className="block px-2 py-2 text-sm text-[#561530] hover:text-[#9e1c60]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pesanan
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfilModalOpen(true);
                  }}
                  className="block w-full text-left px-2 py-2 text-sm text-[#561530] hover:text-[#9e1c60]"
                >
                  Akun
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 text-sm text-red-500 hover:text-red-600"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link href="/masuk" className="w-full mt-2 px-4 py-2 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all text-center cursor-pointer block">
                Masuk
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <ProfilModal
        isOpen={isProfilModalOpen}
        onClose={() => setIsProfilModalOpen(false)}
        onUpdate={() => {
          // Refresh user data if needed
          const refreshUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
              if (profile) setUser(profile);
            }
          };
          refreshUser();
        }}
      />
    </>
  );
}
