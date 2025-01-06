'use client';

import type { Document } from '@/models/Document';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { ToastAction } from '@/components/ui/toast';
import { GET_URI, POST_URI } from '@/constants/application';
import { MessageType, MessageStatus, buildMessage, Message } from '@/models/Message';
import { getData, postJson } from '@/utils/http/client';
import { logInfo, logWarn } from '@/utils/logger';

import { ContentError, ContentPending } from './chat-tip';
import { MessageList } from './message-list';

const FormSchema = z.object({
    input: z
        .string()
        .min(2, {
            message: '起码写两个字吧...',
        })
        .max(200, {
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
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (doc) {
            document.title = `${doc?.title} | 开启交互式内容精读 | 搜读`;
        }
    }, [doc]);

    const resetForm = () => {
        form.reset({
            input: '',
        });
    };

    const { isError, isPending } = useQuery({
        queryKey: [GET_URI.initChat, params.id],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData(`/api/web/initChat?id=${params.id}`);
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

    const searchMutation = useMutation({
        mutationKey: [POST_URI.fileSearch, params.id],
        mutationFn: async (data: z.infer<typeof FormSchema>) => {
            const ret = await postJson('/api/web/fileSearch', { input: data.input, id: params.id });
            if (!ret || ret?.code) {
                toast({
                    variant: 'destructive',
                    title: '响应失败',
                    description: `${ret?.message || '网络异常~'}`,
                    action: <ToastAction altText="Try again">再来一次</ToastAction>,
                });
                return null;
            }
            return ret?.data;
        },
        onMutate: (data: z.infer<typeof FormSchema>) => {
            const msgIn = buildMessage({ cid: params.id, uid: 1, text: data.input, type: MessageType.In, status: MessageStatus.default });
            setMessages(messages.concat(msgIn));
        },
        onSettled: async (data: any) => {
            if (data) {
                const ret = await postJson('/api/web/syncMessage', { id: params.id, data: messages });
                logInfo('syncMessage', ret?.message);
            }
        },
        onSuccess: (resp?: Message) => {
            if (resp) {
                resetForm();
                setMessages(messages.concat(resp));
            }
        },
        onError: (e: any) => {
            logWarn('error on file search: ', e);
            toast({
                title: '啊噢，失败了',
                description: '操作失败，请稍后再试试~',
            });
        },
    });

    if (isPending) {
        return <ContentPending />;
    }

    if (isError) {
        return <ContentError />;
    }

    return (
        <div className="main-content !justify-between">
            <MessageList data={messages} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data: any) => searchMutation.mutate(data))} onReset={resetForm} className="mb-12 w-2/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="input"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{`请在下方输入你想要了解关于《${doc?.title}》的任意信息`}</FormLabel>
                                <FormControl>
                                    <div className="flex items-center">
                                        <Textarea
                                            placeholder="单次最大长度不要超过200字"
                                            className="mr-4 resize-none"
                                            {...field}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    form.handleSubmit((data: any) => searchMutation.mutate(data))();
                                                }
                                            }}
                                        />
                                        <Button type="submit" disabled={searchMutation.isPending}>
                                            发送
                                        </Button>
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
