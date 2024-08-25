import "../styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "如何看待 - 像朋友聊天一样愉快",
  keywords: "聊天机器人，如何看待",
  applicationName: "如何看待",
  description:
    "一个神奇的网站，如何看待将现有文档（PDF、TXT、Words、EPUB）提取并转录成AI知识库，通过对话形式交流原来需要主动阅读消化的信息，像与朋友聊天一样简单、愉快。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
