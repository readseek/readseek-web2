'use client';

import type { Category, Tag } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UploadBox } from '@/components/Chat/UploadBox';
import { OptionType, MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToastAction } from '@/components/ui/toast';
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
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { toast } = useToast();

    const fetchMetaData = useCallback(async () => {
        if (isUploading) return;

        const rets: any[] = await Promise.all(['/api/web/fileCategories', '/api/web/fileTags'].map(uri => getData(uri)));

        setCategories(rets[0]?.list || []);
        setTags(rets[1]?.list || []);
    }, [isUploading]);

    useEffect(() => {
        document.title = metadata.title;

        fetchMetaData();
    }, [fetchMetaData]);

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

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            setIsUploading(true);
            const ret: any = await postForm('/api/web/fileUpload', data);
            if (ret && ret.originalFilename === data.file.name) {
                resetForm();
                // upload success, then jump to user fileList
                router.push(`/list`);
                return;
            }
            toast({
                variant: 'destructive',
                title: '提交失败',
                description: `${ret?.message || '网络服务异常~'}`,
                action: <ToastAction altText="Try again">再来一次</ToastAction>,
            });
        } catch (error) {
            logWarn(error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="main-content">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} onReset={resetForm} className="flex flex-col items-stretch space-y-14 sm:w-[511px]">
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <UploadBox field={field} formState={form.formState} />
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
                                            {categories.map((cat: Category, index: number) => (
                                                <SelectItem key={`cat_${index}`} value={`${cat.id}`}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
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
                            const opts = tags.map((tag: Tag) => ({ label: tag.name, value: `${tag.id}` }));
                            // @ts-ignore
                            const selects = field.value as OptionType[];
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
                        <Button type="reset" className="mr-2 w-1/3" variant="destructive" disabled={isUploading}>
                            重置
                        </Button>
                        <Button type="submit" className="mr-2 h-11 w-1/3" variant="default" disabled={isUploading}>
                            {isUploading ? (
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
