import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "番茄AI写作助手 - 智能创作爆款爽文",
  description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容。支持章节撰写、精修润色、智能续写等功能，完读率90%+，质量评分9.8+。",
  keywords: "番茄小说,AI写作,网文创作,章节生成,爽文创作,小说辅助,自动写作,内容生成,续写,润色",
  authors: [{ name: "番茄AI写作助手团队" }],
  creator: "番茄AI写作助手",
  publisher: "番茄AI写作助手",
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "番茄AI写作助手 - 智能创作爆款爽文",
    description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "番茄AI写作助手 - 智能创作爆款爽文",
    description: "专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
