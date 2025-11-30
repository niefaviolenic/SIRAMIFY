"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const imgLogo1 =
  "https://www.figma.com/api/mcp/asset/3777a01f-7248-4b92-81c8-28d8ce86e840";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <nav className="fixed top-3 left-4 right-4 z-50 bg-white backdrop-blur-md shadow-md rounded-2xl">
      <div className="max-w-[1100px] mx-auto px-4 py-1.5 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center cursor-pointer">
          <Image
            src={imgLogo1}
            alt="Siramify Logo"
            width={70}
            height={20}
            className="object-contain"
            unoptimized
          />
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 text-[#561530] text-sm">
          <Link href={isLandingPage ? "#tentang-kami" : "/#tentang-kami"} className="hover:text-[#9e1c60] transition-all">
            Tentang Kami
          </Link>
          <Link href={isLandingPage ? "#artikel" : "/#artikel"} className="hover:text-[#9e1c60] transition-all">
            Artikel
          </Link>
          <Link href={isLandingPage ? "#produk" : "/#produk"} className="hover:text-[#9e1c60] transition-all">
            Produk
          </Link>
          <Link href={isLandingPage ? "#kontak" : "/#kontak"} className="hover:text-[#9e1c60] transition-all">
            Kontak
          </Link>
        </div>

        {/* DESKTOP LOGIN BUTTON */}
        <Link href="/masuk" className="hidden md:flex px-4 py-1.5 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all">
          Masuk
        </Link>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative w-7 h-7 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <span
            className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out origin-center ${
              isMenuOpen
                ? "rotate-45 top-1/2 -translate-y-1/2"
                : "top-1.5"
            }`}
          ></span>
          <span
            className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out ${
              isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100 top-1/2 -translate-y-1/2"
            }`}
          ></span>
          <span
            className={`absolute h-1 w-7 bg-[#561530] transition-all duration-300 ease-in-out origin-center ${
              isMenuOpen
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
            className="block text-sm text-[#561530] hover:text-[#9e1c60]"
            onClick={() => setIsMenuOpen(false)}
          >
            Tentang Kami
          </Link>
          <Link
            href={isLandingPage ? "#artikel" : "/#artikel"}
            className="block text-sm text-[#561530] hover:text-[#9e1c60]"
            onClick={() => setIsMenuOpen(false)}
          >
            Artikel
          </Link>
          <Link
            href={isLandingPage ? "#produk" : "/#produk"}
            className="block text-sm text-[#561530] hover:text-[#9e1c60]"
            onClick={() => setIsMenuOpen(false)}
          >
            Produk
          </Link>
          <Link
            href={isLandingPage ? "#kontak" : "/#kontak"}
            className="block text-sm text-[#561530] hover:text-[#9e1c60]"
            onClick={() => setIsMenuOpen(false)}
          >
            Kontak
          </Link>

          <Link href="/masuk" className="w-full mt-2 px-4 py-2 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all text-center">
            Masuk
          </Link>
        </div>
      )}
    </nav>
  );
}
