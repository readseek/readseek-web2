'use client';

import type { Document } from '@/models/Document';

import { useQuery } from '@tanstack/react-query';

import { RemoteImage, NodataImage, ErrorImage, LoadingImage } from '@/components/ImageView';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getServerData } from '@/utils/http/server';

export async function getPosts() {
    const ret: any = await getServerData('/api/web/fileList');
    if (!Array.isArray(ret?.data.list) || !ret.data.list.length) {
        return { total: 0, posts: [] };
    }
    return { total: ret.data.total, posts: ret.data.list };
}

export function DocumentPosts() {
    const { data, isError, isPending } = useQuery({
        queryKey: ['fileList'],
        queryFn: getPosts,
        //initialdata, // no use initialdata: https://tanstack.com/query/latest/docs/framework/react/guides/ssr#get-started-fast-with-initialdata
    });

    if (isPending) {
        return (
            <div className="main-content">
                <LoadingImage />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="main-content">
                <ErrorImage />
            </div>
        );
    }

    if (data?.total === 0) {
        return (
            <div className="main-content">
                <NodataImage />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="no-scrollbar grid flex-1 gap-4 overflow-y-scroll p-6 sm:grid-cols-3 xl:grid-cols-5">
                {data?.posts.map((doc: Document, index: number) => {
                    return (
                        <div id="doc" className="rectangle group relative" key={`doc_card_${index}`}>
                            <RemoteImage src={doc.coverUrl!} fill />
                            <div id="info" className="absolute bottom-0 left-0 z-10 flex h-14 w-full flex-col items-start bg-neutral-600 bg-opacity-35 p-1 text-white transition-all duration-300 group-hover:h-[85%] group-hover:bg-opacity-90">
                                {'标题: '}
                                <h2 className="m-0 underline hover:italic hover:no-underline">
                                    <a href={`/chat/${doc.id}`} target="_blank">
                                        {doc.title}
                                    </a>
                                </h2>
                                {'作者: '}
                                <b className="m-0 px-1">{doc.authors?.join('|')}</b>
                                {'简介: '}
                                <h3 id="desc" className="no-scrollbar hidden overflow-auto p-1 italic group-hover:block">
                                    {doc.description}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>
            {data?.total > 10 ?? (
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
            )}
        </div>
    );
}
