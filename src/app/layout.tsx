import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { TabBar } from "@/components/tab-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipi Book - 料理動画からレシピを抽出",
  description:
    "YouTube の料理動画 URL を入力するだけで、AI がレシピ（材料・手順）を自動抽出。保存・検索・買い物リスト機能付き。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-app-bg">
        <TooltipProvider>
          <Header />
          <main className="flex-1 pb-[100px] sm:pb-0">{children}</main>
          <TabBar />
        </TooltipProvider>
      </body>
    </html>
  );
}
