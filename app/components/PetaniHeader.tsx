"use client";

import { useState } from "react";
import Image from "next/image";
import ProfilModal from "./ProfilModal";

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
            className="w-full h-full outline-none text-[#9f9f9f] text-sm placeholder:text-[#9f9f9f] bg-transparent pl-3"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          />
        </div>
        
        {/* Profile Badge - Clickable */}
        <button
          onClick={() => setIsProfilModalOpen(true)}
          className="relative w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0 border border-white cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src={imgImage9}
            alt="Profile Badge"
            fill
            className="object-cover object-center"
            style={{ aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center' }}
            unoptimized
          />
        </button>
      </div>

      {/* Profil Modal */}
      <ProfilModal
        isOpen={isProfilModalOpen}
        onClose={() => setIsProfilModalOpen(false)}
      />
    </div>
  );
}

