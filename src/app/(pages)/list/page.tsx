'use client';

import type { Document } from '@/types';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getData } from '@/utils/http/client';
import { logInfo } from '@/utils/logger';

import { columns } from './columns';
import { DataTable } from './data-table';

const metadata = {
    title: '文库中心 - 搜读',
};

const fetchFiles = async (page: number, size: number = 10) => {
    const data: any = await getData(`/api/web/userFiles?page=${page}&size=${size}`);
    if (data && Array.isArray(data.list)) {
        return data.list;
    }
    return null;
};

export default function FileListPage() {
    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const { data, fetchPreviousPage, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchingPreviousPage } = useInfiniteQuery({
        queryKey: ['fetchUserFiles'],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => fetchFiles(pageParam),
        getPreviousPageParam: (firstPage, pages) => {
            logInfo('getPreviousPageParam', pages);
            return firstPage.prevCursor;
        },
        getNextPageParam: (lastPage, pages) => {
            logInfo('getNextPageParam', pages);
            return lastPage.nextCursor;
        },
    });

    function previousPage() {
        if (!isFetchingPreviousPage) {
            fetchPreviousPage();
            // table.previousPage();
        }
    }

    function nextPage() {
        if (!isFetchingNextPage) {
            fetchNextPage();
            // table.nextPage();
        }
    }

    if (!hasNextPage) {
        logInfo('已加载完毕...');
    }

    return (
        <div className="container flex flex-col">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
