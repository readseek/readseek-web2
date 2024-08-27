import "../styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import {
  FileSearchIcon,
  MessageSquareText,
  User,
  Notebook,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "如何看待 - 像朋友聊天一样交流信息",
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
      <body className={inter.className}>
        <div className="grid h-screen grid-rows-[5rem_1fr]">
          <header className="sticky top-0 flex h-20 flex-row items-center justify-between border-b bg-white px-10 shadow">
            <Avatar className="w-36">
              <AvatarImage src="logo.svg" alt="@ruhekandai" />
              <AvatarFallback>LOGO</AvatarFallback>
            </Avatar>

            <div className="flex w-1/2 items-center space-x-2">
              <Input type="text" placeholder="搜的一下，你就知道" />
              <Button type="submit">
                <FileSearchIcon className="mr-2 h-4 w-4" /> 搜索
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-[12rem_1fr]">
            <nav className="w-48">
              <ul className="fixed top-36 grid w-48 grid-rows-4 gap-5">
                <li className="center h-12 w-full">
                  <Link href="/">
                    <Button type="button">
                      <PackageSearch className="mr-2 h-4 w-4" /> 发现
                    </Button>
                  </Link>
                </li>
                <li className="center h-12 w-full">
                  <Link href="/console">
                    <Button type="button">
                      <Notebook className="mr-2 h-4 w-4" /> 发布
                    </Button>
                  </Link>
                </li>
                <li className="center h-12 w-full">
                  <Link href="/messages">
                    <Button type="button">
                      <MessageSquareText className="mr-2 h-4 w-4" /> 通知
                    </Button>
                  </Link>
                </li>
                <li className="center h-12 w-full">
                  <Link href="/profile">
                    <Button type="button">
                      <User className="mr-2 h-4 w-4" /> 个人
                    </Button>
                  </Link>
                </li>
              </ul>
            </nav>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
