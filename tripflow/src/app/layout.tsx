import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripFlow - 旅行规划",
  description: "轻松规划你的每一次旅行：航班、酒店、美食、购物、记账，一站搞定。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center px-4">
              <a href="/" className="flex items-center gap-2 font-bold text-xl">
                <span>🧳</span>
                <span>TripFlow</span>
              </a>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
