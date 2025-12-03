import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RemoveNextJSLogo from "./components/RemoveNextJSLogo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siramify - Sistem Penyiraman Otomatis",
  description: "Siramify adalah sistem penyiraman otomatis berbasis web yang membantu petani menjaga tanaman tetap sehat dan efisien dalam penggunaan air.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#fef7f5', minHeight: '100vh' }}
      >
        <RemoveNextJSLogo />
        {children}
      </body>
    </html>
  );
}
