"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { supabase } from "../../../utils/supabaseClient";
import Skeleton from "../../components/Skeleton";

// Asset URLs dari Figma
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#6C727C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke="#6C727C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function ArtikelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setArticle(data);
        } else {
          setError("Artikel tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        setError("Gagal memuat artikel");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Function to process content into paragraphs
  const processContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return <div key={index} className="h-4 md:h-5" />;

      // Simple heuristic for headings or list items based on the previous hardcoded structure
      // This might need adjustment based on actual data format in Supabase
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        return (
          <p key={index} className="ml-4 md:ml-6 mb-2">
            {trimmed}
          </p>
        );
      }

      if (trimmed.match(/^\d+\./)) {
        return (
          <h2 key={index} className="font-bold text-sm md:text-base lg:text-lg mt-6 md:mt-8 mb-2 md:mb-3">
            {trimmed}
          </h2>
        );
      }

      return (
        <p key={index} className="mb-3 md:mb-4">
          {trimmed}
        </p>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1100px] mx-auto">
          <Skeleton className="w-3/4 h-10 mb-4 mx-auto" />
          <Skeleton className="w-1/4 h-6 mb-10 mx-auto" />
          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-8 lg:px-10 max-w-[1100px] mx-auto text-center">
          <h1 className="text-2xl font-bold text-[#561530] mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-[#561530] mb-8">{error || "Artikel yang Anda cari tidak tersedia."}</p>
          <Link
            href="/artikel"
            className="inline-flex items-center justify-center px-6 py-2 bg-[#9e1c60] text-white rounded-full hover:bg-[#811844] transition"
          >
            Kembali ke Daftar Artikel
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Back Button & Search Bar */}
        <div className="pt-24 md:pt-28 pb-8">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
            {/* Back Button */}
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 mb-4 md:mb-6 text-[#561530] hover:text-[#9e1c60] transition-colors group"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform group-hover:-translate-x-1 transition-transform"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-xs md:text-sm">Kembali ke Daftar Artikel</span>
            </Link>

            {/* Search Bar */}
            <div className="border border-[#b4bbc9] rounded-[18px] h-[50px] md:h-[65px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2.5 md:gap-3">
              <div className="relative w-5 h-5 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Cari judul artikel"
                className="flex-1 bg-transparent border-none outline-none font-normal text-xs md:text-sm text-[#6c727c] placeholder:text-[#6c727c]"
              />
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="pb-16 md:pb-20">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
            {/* Article Header */}
            <div className="flex flex-col gap-3 md:gap-4 items-center text-center mb-8 md:mb-10 text-[#561530]">
              <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl w-full">
                {article.title}
              </h1>
              <p className="font-normal text-xs md:text-sm lg:text-base">
                {formatDate(article.created_at)}
              </p>
            </div>

            {/* Article Image (Optional - if you want to show the image in detail page too) */}
            {article.image_url && (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 md:mb-10">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Article Body */}
            <div className="font-normal text-xs md:text-sm lg:text-base leading-relaxed text-[#561530] space-y-4 md:space-y-5">
              {processContent(article.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
