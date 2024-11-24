'use client';

import type { Document, Category, Tag } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UploadBox } from '@/components/Chat/UploadBox';
import { OptionType, MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { doGet, doPost } from '@/utils/http';
import { logError, logInfo, logWarn } from '@/utils/logger';

const metadata = {
    title: '内容发布 - 搜读',
};

const FormSchema = z.object({
    file: z
        .string({
            required_error: 'Please select a file to upload.',
        })
        .length(1),
    category: z
        .string({
            required_error: 'Please select a category to display.',
        })
        .length(1),
    tags: z
        .array(z.string(), {
            // Specify the type of the array elements
            required_error: 'Please select at least one tag to display.',
        })
        .min(1),
});

export default function PostContentPage() {
    let doc: Document;

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const fetchMetaData = useCallback(async () => {
        if (isUploading) return;

        const rets: any[] = await Promise.all(['/api/web/fileCategories', '/api/web/fileTags'].map(uri => doGet(uri)));

        setCategories(rets[0]?.list || []);
        setTags(rets[1]?.list || []);
    }, [isUploading]);

    useEffect(() => {
        document.title = metadata.title;

        fetchMetaData();
    }, [fetchMetaData]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            tags: [],
        },
    });

    const onFileSelected = (file: File) => {
        console.log(categories, tags);
        logInfo(file);
    };

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: 'You submitted the following values:',
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <main className="pageBody">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-auto w-1/3 flex-col items-stretch space-y-6">
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <UploadBox onFileSelected={onFileSelected} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>内容分类（有且仅有一个）</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                            console.log('selects', selects);
                            return (
                                <FormItem>
                                    <FormLabel>内容标签（可多选）</FormLabel>
                                    <FormControl>
                                        <MultiSelect selected={selects} options={opts} {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <div className="flex items-center justify-around">
                        <Button type="reset" className="mr-2 h-11 w-1/3" variant="secondary">
                            重置
                        </Button>
                        <Button type="submit" className="mr-2 h-11 w-1/3" variant="default">
                            提交
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    );
}
