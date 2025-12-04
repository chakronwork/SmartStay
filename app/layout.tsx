import type { Metadata } from "next";
import { Inter } from "next/font/google"; // หรือ font ที่นายใช้
import "./globals.css";
import Navbar from "@/components/Navbar"; // 👈 1. import มาก่อน
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartStay - จองที่พักออนไลน์",
  description: "โปรเจคจบสุดเทพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* 👈 2. วางไว้ตรงนี้ เหนือ children */}
        {children}
        <Footer />
      </body>
    </html>
  );
}