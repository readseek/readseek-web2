'use client';

import type { Document, Tag, Category } from '@/types';

import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ErrorImage, LoadingImage } from '@/components/ImageView';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { GET_URI, POST_URI } from '@/constants/application';
import { getData } from '@/utils/http/client';
import { logInfo, logWarn } from '@/utils/logger';

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [doc, setDocument] = useState<Document>();

    useEffect(() => {
        if (doc) {
            document.title = `${doc?.title} | 开启交互式内容精读 | 搜读`;
        }
    }, [doc]);

    const { data, isError, isPending } = useQuery({
        queryKey: [GET_URI.fileChat, params.id],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(`/api/web/fileChat?id=${params.id}`);
            if (!ret || ret?.code) {
                toast({
                    variant: 'destructive',
                    title: '操作失败',
                    description: `${ret?.message || '网络异常~'}`,
                    duration: 30000,
                    action: (
                        <ToastAction
                            altText="Try again"
                            onClick={() => {
                                router.back();
                            }}>
                            稍后再试
                        </ToastAction>
                    ),
                });
                return null;
            }
            setDocument(ret?.data);
            return ret?.data;
        },
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

    return <div className="main-content">内容概要: {JSON.stringify(data, null, 2)}</div>;
}
