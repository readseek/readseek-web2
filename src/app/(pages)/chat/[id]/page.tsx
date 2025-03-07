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
import { Conversation, Message, createMessageEntity } from '@/models/Conversation';
import { getData, postJson } from '@/utils/http/client';
import { GET_URI, POST_URI } from '@/utils/http/index';
import { logWarn } from '@/utils/logger';

import { ContentError, ContentPending } from './chat-tip';
import { MessageList } from './message-list';

const FormSchema = z.object({
    input: z
        .string()
        .trim()
        .min(1, {
            message: '不能一言不发噢',
        })
        .max(200, {
            message: '最多一次发送200字噢',
        }),
});

export default function ChatPage({ params }) {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
    const { toast } = useToast();
    const [doc, setDocument] = useState<Document>();
    const [conversation, setConversation] = useState<Conversation>();

    useEffect(() => {
        if (doc) {
            document.title = `${doc?.title} | 开启精读模式 | 交互式阅读先驱`;
        }
    }, [doc]);

    const resetForm = () => {
        form.reset({ input: '' });
        setTimeout(() => {
            form.setFocus('input', { shouldSelect: true });
        }, 100);
    };

    const { isError, isPending } = useQuery({
        queryKey: [GET_URI.convInit, params.id],
        placeholderData: keepPreviousData,
        refetchOnMount: 'always',
        experimental_prefetchInRender: true,
        queryFn: async () => {
            const ret = await getData(GET_URI.convInit, { id: params.id });
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

            if (ret && ret?.data?.doc) {
                setDocument(ret?.data?.doc);
            }

            if (ret && ret?.data?.conv) {
                setConversation(ret?.data?.conv);
            }

            return ret?.data;
        },
    });

    const chattingMutation = useMutation({
        mutationKey: [POST_URI.convChat, params.id],
        mutationFn: async (data: z.infer<typeof FormSchema>) => {
            const ret = await postJson(POST_URI.convChat, { input: data.input, chatId: params.id, cid: doc?.id });
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
            conversation?.messages.push(createMessageEntity({ role: 'human', content: data.input }));
            setConversation(conversation);
        },
        onSuccess: (resp?: Message) => {
            if (resp) {
                resetForm();
                conversation?.messages.push(resp);
                setConversation(conversation);
            }
        },
        onError: (e: any) => {
            logWarn('error on chatting: ', e);
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
            <MessageList data={conversation?.messages} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data: any) => chattingMutation.mutate(data))} onReset={resetForm} className="mb-12 w-2/3 space-y-6">
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
                                            disabled={chattingMutation.isPending}
                                            {...field}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    form.handleSubmit((data: any) => chattingMutation.mutate(data))();
                                                }
                                            }}
                                        />
                                        <Button type="submit" disabled={chattingMutation.isPending}>
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
