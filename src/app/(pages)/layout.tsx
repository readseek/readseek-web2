import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import '@/styles/globals.css';
import { BookPlus, FileSearchIcon, LibrarySquare, PackageSearch, User } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '如何看待 - 交互式阅读先驱 - 用聊天的方式阅读一本书',
    description: '一款神奇的智能辅助阅读工具，通过将文档（pdf,txt,epub,markdown,docx）提取并转录成AI知识库，然后用聊天的方式进行深度阅读、并交流关于如何看待书中的各种问题。如何看待是交互式阅读先驱，让我们用聊天的方式阅读一本书吧。',
    applicationName: '如何看待',
    keywords: '阅读机器人,聊天机器人,交互式阅读,如何看待',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <div className="grid h-screen grid-rows-[5rem_1fr]">
                    <header className="sticky top-0 flex h-20 flex-row items-center justify-between border-b bg-white px-10 shadow">
                        <Avatar className="w-36">
                            <AvatarImage src="logo.svg" alt="@ruhekandai" />
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
            </body>
        </html>
    );
}
