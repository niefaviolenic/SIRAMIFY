"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import Skeleton from "../components/Skeleton";

// Asset URLs
const imgArticlePlaceholder = "https://ik.imagekit.io/et2ltjxzhq/Siramify/siram_tentang_kami.webp?updatedAt=1764650943034";

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

export default function ArtikelPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setArticles(data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (!content) return "";
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  return (
    <div className="bg-white relative w-full min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 lg:px-10">
          {/* Search Bar */}
          <div className="border border-[#b4bbc9] rounded-[18px] h-[50px] md:h-[65px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2.5 md:gap-3 mb-8 md:mb-12">
            <div className="relative w-5 h-5 md:w-8 md:h-8 shrink-0 flex items-center justify-center">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Cari judul artikel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-normal text-xs md:text-sm text-[#6c727c] placeholder:text-[#6c727c]"
            />
          </div>

          {/* Articles List */}
          <div className="flex flex-col gap-8 md:gap-12 items-center mb-8 md:mb-12">
            {isLoading ? (
              // Skeleton Loading
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 items-center w-full">
                    <div className="flex flex-col gap-4 md:gap-6 lg:gap-7 items-start w-full md:w-[68%]">
                      <div className="flex flex-col gap-3 md:gap-4 items-start w-full">
                        <Skeleton className="w-3/4 h-8" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                      </div>
                      <Skeleton className="w-1/4 h-4" />
                    </div>
                    <div className="relative w-full md:w-[32%] shrink-0">
                      <Skeleton className="w-full aspect-[4/3] rounded-[15.555px]" />
                    </div>
                  </div>
                  {i < 3 && <div className="mt-8 md:mt-12 border-t border-[#b4bbc9] w-full" />}
                </div>
              ))
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article, index) => (
                <div key={article.id} className="w-full">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 items-center w-full">
                    {/* Article Content */}
                    <Link href={`/artikel/${article.id}`} className="flex flex-col gap-4 md:gap-6 lg:gap-7 items-start text-[#561530] w-full md:w-[68%] hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="flex flex-col gap-3 md:gap-4 items-start w-full">
                        <h2 className="font-bold text-base md:text-xl lg:text-2xl w-full hover:text-[#9e1c60] transition-colors">
                          {article.title}
                        </h2>
                        <p className="font-normal text-[10px] md:text-xs lg:text-sm w-full">
                          {truncateContent(article.content, 200)}
                        </p>
                      </div>
                      <p className="font-normal text-[9px] md:text-xs lg:text-sm">
                        {formatDate(article.created_at)}
                      </p>
                    </Link>

                    {/* Article Image */}
                    <Link href={`/artikel/${article.id}`} className="relative w-full md:w-[32%] shrink-0 group cursor-pointer">
                      <div className="relative w-full aspect-[4/3] rounded-[15.555px] overflow-hidden transition-transform group-hover:scale-105">
                        <Image
                          src={article.image_url || imgArticlePlaceholder}
                          alt={article.title}
                          fill
                          className="object-cover rounded-[15.555px] transition-opacity group-hover:opacity-90"
                          unoptimized
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Divider */}
                  {index < filteredArticles.length - 1 && (
                    <div className="mt-8 md:mt-12 border-t border-[#b4bbc9] w-full" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-[#561530] text-sm">Tidak ada artikel ditemukan.</p>
            )}
          </div>

          {/* Load More Button - Optional: Can be implemented with pagination if needed */}
          {/* <div className="flex justify-center">
            <button className="border-2 border-[#9e1c60] border-solid box-border flex gap-2 items-center justify-center px-8 md:px-12 lg:px-16 py-3 md:py-4 lg:py-5 rounded-full bg-transparent hover:bg-[#9e1c60] active:brightness-75 transition group">
              <span className="font-bold text-[10px] md:text-xs lg:text-sm text-[#9e1c60] group-hover:text-white transition">
                Muat Lebih Banyak
              </span>
            </button>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
