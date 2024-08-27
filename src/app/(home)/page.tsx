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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BookCard = () => {
  return Array.from({ length: 30 }).map((_, index: number) => {
    return (
      <div className="rectangle bg-pink-500" key={`book_card_${index}`}>
        {index < 10 ? `0${index + 1}` : index + 1}
      </div>
    );
  });
};

export default function Home() {
  return (
    <div className="grid h-screen grid-rows-[5rem_1fr]">
      <header className="sticky top-0 flex h-20 flex-row items-center justify-between border-b bg-white px-10 shadow">
        <Avatar className="w-24">
          <AvatarImage src="logo.png" alt="@ruhekandai" />
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
              <Button type="button">
                <PackageSearch className="mr-2 h-4 w-4" /> 发现
              </Button>
            </li>
            <li className="center h-12 w-full">
              <Button type="button">
                <Notebook className="mr-2 h-4 w-4" /> 发布
              </Button>
            </li>
            <li className="center h-12 w-full">
              <Button type="button">
                <MessageSquareText className="mr-2 h-4 w-4" /> 通知
              </Button>
            </li>
            <li className="center h-12 w-full">
              <Button type="button">
                <User className="mr-2 h-4 w-4" /> 个人
              </Button>
            </li>
          </ul>
        </nav>

        <main className="flex flex-col">
          <div className="no-scrollbar grid flex-1 gap-4 overflow-y-scroll p-6 sm:grid-cols-3 xl:grid-cols-5">
            {BookCard()}
          </div>
          <footer className="center h-20">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </footer>
        </main>
      </div>
    </div>
  );
}
