import {
  FileSearchIcon,
  MessageSquareText,
  User,
  Notebook,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function HomePage() {
  return (
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
  );
}
