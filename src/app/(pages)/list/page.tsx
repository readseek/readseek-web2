'use client';

import type { Document } from '@/models/Document';

import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LoadingImage, ErrorImage } from '@/components/ImageView';
import { useToast } from '@/components/ui/hooks/use-toast';
import { getData, postJson } from '@/utils/http/client';
import { GET_URI, POST_URI } from '@/utils/http/index';
import { logInfo, logWarn } from '@/utils/logger';

import { DataTable } from './data-table';

const metadata = {
    title: '文库中心 - 搜读',
};

export default function FileListPage(props) {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { isPending, isError, error, data, refetch } = useQuery({
        queryKey: [GET_URI.userFiles, pagination],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(GET_URI.userFiles, { page: pagination.pageIndex, size: pagination.pageSize });
            if (!ret || ret?.code) {
                return null;
            }
            return ret?.data?.list ?? [];
        },
    });

    const mutationDelete = useMutation({
        mutationKey: [POST_URI.fileDelete],
        mutationFn: async (doc?: Document) => {
            const ret = await postJson(POST_URI.fileDelete, { id: doc?.id, type: doc?.type });
            return ret?.code === 0;
        },
        onSuccess: (data: any) => {
            if (!data) {
                toast({
                    title: '啊噢~',
                    description: '删除失败，请稍后再一次~',
                });
                return;
            }
            refetch();
        },
        onError: (e: any) => {
            logWarn('handleDelete onError: ', e);
            toast({
                title: '啊噢~',
                description: '操作失败，请稍后再试试~',
            });
        },
    });

    function handlePagination(pagination: PaginationState) {
        logInfo('handlePagination', pagination);
        setPagination(pagination);
    }

    function handleChatWith(id: string) {
        router.push(`/chat/${id}`);
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
                onDelete={(doc?: Document) => {
                    mutationDelete.mutate(doc);
                }}
            />
        </div>
    );
}
