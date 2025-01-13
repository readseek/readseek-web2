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

export function PostCards() {
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
        <div className="flex h-full flex-col">
            <div className="grid flex-1 gap-4 overflow-y-scroll p-6 sm:grid-cols-3 xl:grid-cols-5">
                {data?.posts.map((doc: Document, index: number) => {
                    return (
                        <div id="doc" className="rectangle group relative bg-slate-50" key={`card_${doc.id}_${index}`}>
                            <RemoteImage src={doc.coverUrl!} fill />
                            <div
                                id="info"
                                className="no-scrollbar absolute bottom-0 left-0 z-10 flex h-[25%] w-full flex-col items-start overflow-y-scroll bg-neutral-600 bg-opacity-45 p-1 text-white transition-all duration-500 group-hover:h-[80%] group-hover:bg-opacity-85">
                                <span className="text-lg underline">{'标题: '}</span>
                                <h2 className="max-h-12 w-full overflow-clip indent-2 text-base hover:italic hover:underline">
                                    <a href={`/chat/${doc.id}`} target="_blank" title={doc.title}>
                                        {doc.title}
                                    </a>
                                </h2>
                                {doc.authors ? (
                                    <>
                                        <span className="text-lg underline">{'作者: '}</span>
                                        <h3 className="indent-2">{doc.authors?.join(', ')}</h3>
                                    </>
                                ) : null}
                                {doc.keywords ? (
                                    <>
                                        <span className="text-lg underline">{'关键字: '}</span>
                                        <h3 className="indent-2">{doc.keywords?.join(', ')}</h3>
                                    </>
                                ) : null}
                                <span className="text-lg underline">{'内容摘要: '}</span>
                                <p id="desc" className="indent-2 text-sm group-hover:block">
                                    {doc.description}
                                </p>
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
