'use client';

import type { Document } from '@/types';

import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { LoadingImage, ErrorImage } from '@/components/ImageView';
import { GET_URI, POST_URI } from '@/constants/Application';
import { getData, postJson } from '@/utils/http/client';
import { logInfo, logWarn } from '@/utils/logger';

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

    const { isPending, isError, error, data } = useQuery({
        queryKey: [GET_URI.userFiles, pagination],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(`/api/web/userFiles?page=${pagination.pageIndex}&size=${pagination.pageSize}`);
            if (!ret || ret?.code) {
                return null;
            }
            return ret?.data?.list ?? [];
        },
    });

    const mutationDelete = useMutation({
        mutationKey: [POST_URI.fileDelete],
        mutationFn: async (id?: string) => {
            const ret = await postJson('/api/web/fileDelete', { id });
            return ret?.code === 0;
        },
        onSuccess: (data: any) => {
            logInfo('handleDelete onSuccess: ', data);
            if (data) {
                // TODO: refresh
            }
        },
        onError: (e: any) => {
            logWarn('handleDelete onError: ', e);
        },
    });

    function handlePagination(pagination: PaginationState) {
        logInfo('handlePagination', pagination);
        setPagination(pagination);
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
            <DataTable
                data={data}
                onChatWith={handleChatWith}
                onPaginationChanged={handlePagination}
                onDelete={(id: string) => {
                    mutationDelete.mutate(id);
                }}
            />
        </div>
    );
}
