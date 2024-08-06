import "../styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "如何看待 - 问答就像与朋友聊天一样简单",
  description:
    "一个神奇的网站，通过将现有文本文档、知识库转化成AI的记忆，使得问答、查找更智能和简单。",
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
