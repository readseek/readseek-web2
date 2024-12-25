'use client';

import type { Document, Tag, Category } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ErrorImage, LoadingImage } from '@/components/ImageView';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToastAction } from '@/components/ui/toast';
import { GET_URI, POST_URI } from '@/constants/application';
import { getData } from '@/utils/http/client';
import { logInfo, logWarn } from '@/utils/logger';

const FormSchema = z.object({
    input: z
        .string()
        .min(2, {
            message: '起码写两个字吧...',
        })
        .max(500, {
            message: '最多一次发送500字噢',
        }),
});

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
    const { toast } = useToast();
    const [doc, setDocument] = useState<Document>();

    useEffect(() => {
        if (doc) {
            document.title = `${doc?.title} | 开启交互式内容精读 | 搜读`;
        }
    }, [doc]);

    const { data, isError, isPending } = useQuery({
        queryKey: [GET_URI.prepareChat, params.id],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(`/api/web/prepareChat?id=${params.id}`);
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

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: '你提交了以下内容：',
            description: (
                <pre className="mt-2 w-[480px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
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
                <ErrorImage />
            </div>
        );
    }

    return (
        <div className="main-content !justify-between">
            <div className="no-scrollbar my-5 w-[80%] overflow-y-scroll rounded-md bg-gray-100 p-4">
                <code className="text-black">{JSON.stringify(data, null, 2)}</code>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mb-12 w-2/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="input"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>请在下方回复你想要了解的信息：</FormLabel>
                                <FormControl>
                                    <div className="flex items-center">
                                        <Textarea placeholder="单次最大长度不要超过500字" className="mr-4 resize-none" {...field} />
                                        <Button type="submit">发送</Button>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    You can <span>@mention</span> other users.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
}
