"use client";

import { useState } from "react";
import Image from "next/image";
import ProfilModal from "./ProfilModal";

const imgMaterialSymbolsAccountCircle = "https://www.figma.com/api/mcp/asset/f1e7f691-81f0-46fc-a8e3-751cdb8564b1";
const imgEllipse248 = "https://www.figma.com/api/mcp/asset/0424a7b7-23f5-467f-a8b2-b049141f61e0";
const imgVector = "https://www.figma.com/api/mcp/asset/2d50e43c-8e6c-4cfe-8046-8ee95c01e548";
const imgImage9 = "/profile.png";

export default function PetaniHeader() {
  const [isProfilModalOpen, setIsProfilModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Search Bar with Icons */}
      <div className="bg-[#9e1c60] rounded-[20px] px-2.5 py-1.5 flex items-center gap-2.5 h-[33px]">
        {/* Search Input */}
        <div className="bg-white rounded-[15px] h-[22px] w-[120px] flex items-center px-2 relative">
          <Image
            src={imgVector}
            alt="Search"
            width={10}
            height={11}
            className="absolute left-1 top-1/2 -translate-y-1/2 object-contain pointer-events-none opacity-60"
            unoptimized
          />
          <input
            type="text"
            placeholder="Cari"
            className="w-full h-full outline-none text-[#9f9f9f] text-[10px] placeholder:text-[#9f9f9f] bg-transparent pl-3"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          />
        </div>
        
        {/* Account Circle Icon */}
        <button
          onClick={() => setIsProfilModalOpen(true)}
          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src={imgMaterialSymbolsAccountCircle}
            alt="Account"
            width={16}
            height={16}
            className="object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
            unoptimized
          />
        </button>
        
        {/* Profile Badge */}
        <div className="relative w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0 border border-white">
          <Image
            src={imgImage9}
            alt="Profile Badge"
            fill
            className="object-cover object-center"
            style={{ aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center' }}
            unoptimized
          />
        </div>
      </div>

      {/* Profil Modal */}
      <ProfilModal
        isOpen={isProfilModalOpen}
        onClose={() => setIsProfilModalOpen(false)}
      />
    </div>
  );
}

