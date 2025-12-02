"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const imgLogo1 =
  "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    if (isLandingPage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
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

        {/* DESKTOP LOGIN BUTTON */}
        <Link href="/masuk" className="hidden md:flex px-4 py-1.5 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all cursor-pointer">
          Masuk
        </Link>

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

          <Link href="/masuk" className="w-full mt-2 px-4 py-2 border-2 border-[#9e1c60] rounded-full text-[#9e1c60] text-sm hover:bg-[#9e1c60] hover:text-white transition-all text-center cursor-pointer">
            Masuk
          </Link>
        </div>
      )}
    </nav>
  );
}
