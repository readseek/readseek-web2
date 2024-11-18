import type { Document } from '@/types';

import { RemoteImage, NodataImage } from '@/components/ImageView';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { doGet } from '@/utils/http';

export default async function HomePage() {
    const data: any = await doGet('/api/web/fileList');
    if (data && data.total > 0) {
        const contentView = data.list.map((doc: Document, index: number) => {
            return (
                <div className="rectangle" key={`doc_card_${index}`}>
                    <RemoteImage src={doc.coverUrl} fill={true} />
                </div>
            );
        });
        return (
            <main className="flex flex-col">
                <div className="no-scrollbar grid flex-1 gap-4 overflow-y-scroll p-6 sm:grid-cols-3 xl:grid-cols-5">{contentView}</div>
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
    return (
        <main className="flex flex-col">
            <NodataImage />
        </main>
    );
}
