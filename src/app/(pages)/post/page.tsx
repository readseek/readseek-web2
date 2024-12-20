'use client';

import type { Category, Tag } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UploadBox } from '@/components/Chat/UploadBox';
import { OptionType, MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToastAction } from '@/components/ui/toast';
import { GET_URI, POST_URI } from '@/constants/Application';
import { getData, postForm } from '@/utils/http/client';
import { logInfo, logWarn } from '@/utils/logger';

const metadata = {
    title: '内容发布 - 搜读',
};

const FormSchema = z.object({
    file: z
        .instanceof(globalThis.File, {
            message: '请选择一个有效的文件',
        })
        .refine(file => file.size > 0, {
            message: '文件内容不能为空',
        }),
    category: z.string().min(1, '请为要上传的内容选择一个分类（有且仅有一个）'),
    tags: z
        .array(
            z.object({
                label: z.string(),
                value: z.string(),
            }),
        )
        .min(1, '请为内容至少选择一个标签（可多选）'),
});

export default function PostContentPage() {
    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        mode: 'onChange',
        defaultValues: {
            file: undefined,
            tags: [],
            category: '',
        },
    });

    const resetForm = () => {
        form.reset();
    };

    const catesQuery = useQuery({
        queryKey: [GET_URI.fileCategories],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData('/api/web/fileCategories');
            if (!ret || ret?.code) {
                return null;
            }
            return ret?.data?.list ?? [];
        },
    });
    const tagsQuery = useQuery({
        queryKey: [GET_URI.fileTags],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const ret = await getData('/api/web/fileTags');
            if (!ret || ret?.code) {
                return null;
            }
            return ret?.data?.list ?? [];
        },
    });

    const mutationUpload = useMutation({
        mutationKey: [POST_URI.fileUpload],
        mutationFn: async (data: z.infer<typeof FormSchema>) => {
            // logInfo('mutationUpload:', data);
            const ret = await postForm('/api/web/fileUpload', data);
            if (!ret || ret?.code) {
                toast({
                    variant: 'destructive',
                    title: '提交失败',
                    description: `${ret?.message || '网络服务异常~'}`,
                    action: <ToastAction altText="Try again">再来一次</ToastAction>,
                });
                return false;
            }
            return true;
        },
        onSuccess: (data: any) => {
            logInfo('onSuccess', data);
            if (data?.fileHash) {
                resetForm();
                router.push(`/list`);
            }
        },
        onError: (e: any) => {
            logWarn('handleUpload onError: ', e);
            toast({
                title: '啊噢，失败了',
                description: '操作失败，请稍后再试试~',
            });
        },
    });

    return (
        <div className="main-content">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data: any) => mutationUpload.mutate(data))} onReset={resetForm} className="flex flex-col items-stretch space-y-14 sm:w-[511px]">
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <UploadBox field={field} formState={form.formState} disabled={mutationUpload.isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="h-[3rem]">
                                <FormLabel>分类</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {Array.isArray(catesQuery?.data) ? (
                                                catesQuery.data.map((cat: Category, index: number) => (
                                                    <SelectItem key={`cat_${index}`} value={`${cat.id}`}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="null">loading...</SelectItem>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => {
                            // @ts-ignore
                            const selects = field.value as OptionType[];
                            const opts: any = Array.isArray(tagsQuery?.data) && tagsQuery.data.map((tag: Tag) => ({ label: tag.name, value: `${tag.id}` }));
                            return (
                                <FormItem className="h-[3rem]">
                                    <FormLabel>标签</FormLabel>
                                    <FormControl>
                                        <MultiSelect selected={selects} options={opts} {...field} className="sm:w-[511px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <div className="flex items-center justify-around">
                        <Button type="reset" className="mr-2 w-1/3" variant="destructive" disabled={mutationUpload.isPending}>
                            重置
                        </Button>
                        <Button type="submit" className="mr-2 h-11 w-1/3" variant="default" disabled={mutationUpload.isPending}>
                            {mutationUpload.isPending ? (
                                <>
                                    <svg className="mr-3 h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-t-transparent" viewBox="0 0 50 50" />
                                    正在处理...
                                </>
                            ) : (
                                '提交'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
