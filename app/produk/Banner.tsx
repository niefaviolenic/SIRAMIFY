"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    bgColor: "#1eb8dd",
    title: "Mau belanja kebutuhan tani lebih hemat?",
    description: "Cek berbagai promo menarik untuk bibit, pupuk, dan produk pertanian pilihan di Siramify.",
  },
  {
    id: 2,
    bgColor: "#c45af6",
    title: "Mau produk pertanian yang pasti kualitasnya?",
    description: "Belanja di Siramify Store, semua produk terkurasi dan aman untuk budidaya Anda.",
  },
  {
    id: 3,
    bgColor: "#3bc152",
    title: "Yuk, belanja kebutuhan kebun di Siramify",
    description: "Temukan bibit, pupuk, selada merah segar, perlengkapan kebun, dan banyak kategori lainnya.",
  },
];

const imgVector = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siramify_char.png";

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full mb-12 group">
      {/* Slides Container */}
      <div className="w-full relative overflow-hidden rounded-[12px] h-[280px] md:h-[220px]">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-full relative"
              style={{ backgroundColor: slide.bgColor }}
            >
              <div className="relative w-full h-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start px-12 md:px-[82px]">
                <div className="flex flex-col gap-3 md:gap-4 max-w-full md:max-w-[600px] z-20 text-center md:text-left">
                  <h2 className="text-white font-bold text-xl md:text-[28px] leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-white text-sm md:text-[18px] leading-normal">
                    {slide.description}
                  </p>
                </div>

                {/* Reduced image size */}
                <div className="absolute bottom-0 right-4 md:right-12 w-[110px] md:w-[140px] h-[140px] md:h-[180px] z-10 opacity-80 md:opacity-100">
                  <Image
                    src={imgVector}
                    alt="Siramify Character"
                    fill
                    className="object-contain object-bottom"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots for navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentSlide ? "bg-white w-6" : "bg-white/50"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Positioned half outside */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-[#561530] transition-all hover:scale-110 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-[#561530] transition-all hover:scale-110 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
