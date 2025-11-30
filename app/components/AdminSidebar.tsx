"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

const imgLogo3 = "https://www.figma.com/api/mcp/asset/cb1aead5-eb52-46f9-aa1d-a19a8f5f6404";
const imgMdiLogout = "https://www.figma.com/api/mcp/asset/dad4bb40-4a73-4f85-9cf0-f90292ed7214";
const imgMaterialSymbolsHomeOutlineRounded = "https://www.figma.com/api/mcp/asset/b2bc3d9e-cecb-436b-b4d9-465f36ee11f8";
const imgIconParkOutlineAdProduct = "https://www.figma.com/api/mcp/asset/adaf976e-47d5-455d-a8c6-e564b6b84735";
const imgIconParkOutlineSettingTwo = "https://www.figma.com/api/mcp/asset/7aa25b98-044a-41cd-8dc2-b7f438a0421d";

// Placeholder icons - using similar icons from Figma or generic ones
const imgUserIcon = "https://www.figma.com/api/mcp/asset/f1e7f691-81f0-46fc-a8e3-751cdb8564b1"; // Account circle
const imgTransactionIcon = "https://www.figma.com/api/mcp/asset/adaf976e-47d5-455d-a8c6-e564b6b84735"; // Using product icon as placeholder
const imgSystemIcon = "https://www.figma.com/api/mcp/asset/94f3564e-9888-4307-9622-ad07b90d3648"; // Power icon as placeholder

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { href: "/admin/beranda", label: "Beranda", icon: imgMaterialSymbolsHomeOutlineRounded },
  { href: "/admin/manajemen-user", label: "Manajemen User", icon: imgUserIcon },
  { href: "/admin/manajemen-produk", label: "Manajemen Produk", icon: imgIconParkOutlineAdProduct },
  { href: "/admin/manajemen-transaksi", label: "Manajemen Transaksi", icon: imgTransactionIcon },
  { href: "/admin/manajemen-sistem", label: "Manajemen Sistem", icon: imgSystemIcon },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: imgIconParkOutlineSettingTwo },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      // Tetap redirect ke landing page meskipun ada error
      router.push("/");
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-[180px] bg-[#eed2e1] rounded-r-[15px] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-2">
        <Image
          src={imgLogo3}
          alt="Siramify Logo"
          width={130}
          height={22}
          className="object-contain"
          style={{ filter: 'contrast(1.3) brightness(0.9) saturate(1.1)' }}
          unoptimized
        />
      </div>

      {/* Garis Pemisah */}
      <div className="mx-4 -mt-2 border-t border-[#9e1c60] border-opacity-30"></div>

      {/* Menu Items */}
      <div className="flex-1 px-2 py-3 mt-5">
        <div className="flex flex-col gap-[3px]">
          {menuItems.map((item, index) => {
            // Untuk menu dengan sub-routes, aktifkan juga jika pathname dimulai dengan path tersebut
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 px-3 py-2"
              >
                {/* Kotak ungu background */}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full bg-[#9e1c60] rounded-l-[10px]" style={{ right: '-8px', width: 'calc(100% + 8px)' }} />
                )}
                {/* Icon dan Text */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <div 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '18px',
                      height: '18px',
                      minWidth: '18px',
                      minHeight: '18px',
                      maxWidth: '18px',
                      maxHeight: '18px'
                    }}
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={18}
                      height={18}
                      className="object-contain"
                      style={{
                        width: '18px',
                        height: '18px',
                        maxWidth: '18px',
                        maxHeight: '18px',
                        minWidth: '18px',
                        minHeight: '18px',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                        imageRendering: 'crisp-edges',
                        ...(isActive 
                          ? { filter: 'brightness(0) invert(1)' } 
                          : { filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)' }
                        )
                      }}
                      unoptimized
                    />
                  </div>
                  <span
                    className={`font-bold text-[11px] leading-tight ${
                      isActive ? "text-white" : "text-[#9e1c60]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-4 -mb-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2.5 text-[#9e1c60] hover:opacity-70 transition"
        >
          <div 
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '18px',
              height: '18px',
              minWidth: '18px',
              minHeight: '18px',
              maxWidth: '18px',
              maxHeight: '18px'
            }}
          >
            <Image
              src={imgMdiLogout}
              alt="Logout"
              width={18}
              height={18}
              className="object-contain"
              style={{
                width: '18px',
                height: '18px',
                maxWidth: '18px',
                maxHeight: '18px',
                minWidth: '18px',
                minHeight: '18px',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                imageRendering: 'crisp-edges',
                filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(300deg) brightness(92%) contrast(92%)'
              }}
              unoptimized
            />
          </div>
          <span className="font-bold text-[11px] leading-tight">Keluar</span>
        </button>
      </div>
    </div>
  );
}

