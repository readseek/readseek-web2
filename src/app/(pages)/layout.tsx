import type { Metadata } from 'next';

import { BookPlus, FileSearchIcon, LibrarySquare, PackageSearch, User } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';

import '@/styles/globals.css';

export const metadata: Metadata = {
    title: '搜读 - 用对话的方式精读一本书 - 交互式阅读先驱',
    description: '搜读是一款神奇的智能阅读工具，通过将文档（pdf,txt,epub,markdown,docx）提取并转录成AI知识库，然后用对话的方式进行有深度的高效阅读和互动。用创新的方式提升阅读的快乐指数，交互式阅读先驱。',
    keywords: '搜读,交互式阅读,对话式阅读,智能阅读工具,在线阅读平台',
    applicationName: '搜读',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <div className="grid h-screen grid-rows-[5rem_1fr]">
                    <header className="sticky top-0 flex h-20 flex-row items-center justify-between border-b bg-white px-10 shadow">
                        <Avatar className="w-36">
                            <AvatarImage src="logo.svg" alt="@readseek" />
                            <AvatarFallback>LOGO</AvatarFallback>
                        </Avatar>

                        <div className="flex w-1/2 items-center space-x-2">
                            <Input type="text" placeholder="搜的一下，你就知道好多 🤪" />
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
                                    <Link href="/post">
                                        <Button type="button">
                                            <BookPlus className="mr-2 h-4 w-4" /> 发布
                                        </Button>
                                    </Link>
                                </li>
                                <li className="center h-12 w-full">
                                    <Link href="/list">
                                        <Button type="button">
                                            <LibrarySquare className="mr-2 h-4 w-4" /> 文库
                                        </Button>
                                    </Link>
                                </li>
                                <li className="center h-12 w-full">
                                    <Link href="/personal">
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
                <Toaster />
            </body>
        </html>
    );
}
