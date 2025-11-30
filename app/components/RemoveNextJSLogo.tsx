"use client";

import { useEffect } from "react";

export default function RemoveNextJSLogo() {
  useEffect(() => {
    const removeLogo = () => {
      // Hapus semua elemen yang mungkin adalah logo Next.js
      const allElements = document.querySelectorAll("*");
      
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const style = window.getComputedStyle(htmlEl);
        const position = style.position;
        const left = style.left;
        const bottom = style.bottom;
        const zIndex = style.zIndex;
        
        // Jika elemen fixed di bottom-left dengan z-index tinggi
        if (
          position === "fixed" &&
          (left === "0px" || left === "0") &&
          (bottom === "0px" || bottom === "0")
        ) {
          // Cek apakah ada link ke nextjs.org atau vercel.com
          const hasNextJSLink =
            htmlEl.querySelector('a[href*="nextjs.org"]') ||
            htmlEl.querySelector('a[href*="vercel.com"]');
          
          // Cek apakah ada teks 'N' atau elemen dengan background hitam
          const bgColor = style.backgroundColor;
          const isDarkBg =
            bgColor.includes("rgb(0, 0, 0)") ||
            bgColor.includes("rgb(17, 17, 17)") ||
            bgColor === "black";
          
          // Cek apakah ada SVG atau elemen dengan huruf 'N'
          const hasNText = htmlEl.textContent?.trim() === "N";
          const hasSVG = htmlEl.querySelector("svg");
          
          if (hasNextJSLink || (isDarkBg && (hasNText || hasSVG))) {
            htmlEl.remove();
            return;
          }
        }
      });
      
      // Hapus berdasarkan ID dan class
      const idsToRemove = [
        "__next-build-watcher",
        "__nextjs-toast-router",
      ];
      idsToRemove.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      
      const classesToRemove = [
        "__nextjs-toast-router",
        "__nextjs-toast",
      ];
      classesToRemove.forEach((className) => {
        const els = document.querySelectorAll(`.${className}`);
        els.forEach((el) => el.remove());
      });
      
      // Hapus berdasarkan data attributes
      const dataAttrs = [
        '[data-nextjs-toast]',
        '[data-nextjs-dialog]',
      ];
      dataAttrs.forEach((selector) => {
        const els = document.querySelectorAll(selector);
        els.forEach((el) => el.remove());
      });
      
      // Hapus semua link ke nextjs.org atau vercel.com dan parent-nya
      const links = document.querySelectorAll(
        'a[href*="nextjs.org"], a[href*="vercel.com"]'
      );
      links.forEach((link) => {
        const parent = link.closest("div");
        if (parent) {
          parent.remove();
        } else {
          link.remove();
        }
      });
    };

    // Jalankan segera
    removeLogo();

    // Jalankan lagi setelah delay
    const intervals = [50, 100, 200, 500, 1000, 2000];
    intervals.forEach((delay) => {
      setTimeout(removeLogo, delay);
    });

    // Monitor perubahan DOM
    const observer = new MutationObserver(() => {
      removeLogo();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

