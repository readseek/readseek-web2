'use client';

import type { Document } from '@/types';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { LoadingImage, ErrorImage } from '@/components/ImageView';
import { GET_URI, POST_URI } from '@/constants/Application';
import { getData } from '@/utils/http/client';
import { logInfo } from '@/utils/logger';

import { DataTable } from './data-table';

const metadata = {
    title: '文库中心 - 搜读',
};

export default function FileListPage() {
    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { isPending, isError, error, data, isPlaceholderData } = useQuery({
        queryKey: [GET_URI.userFiles, pagination],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(`/api/web/userFiles?page=${pagination.pageIndex}&size=${pagination.pageSize}`);
            if (ret && Array.isArray(ret.list)) {
                return ret.list;
            }
            return null;
        },
    });

    function handlePagination(pagination: PaginationState) {
        logInfo('handlePagination', pagination);
        setPagination(pagination);
    }

    function handleDelete(id: string) {
        logInfo('handleDelete', id);
    }

    function handleChatWith(id: string) {
        logInfo('handleChatWith', id);
    }

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
                <ErrorImage message={error.message} />
            </div>
        );
    }

    return (
        <div className="container flex flex-col">
            <DataTable data={data} onPaginationChanged={handlePagination} onDelete={handleDelete} onChatWith={handleChatWith} />
        </div>
    );
}
