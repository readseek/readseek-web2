'use client';

import type { Document, Category, Tag } from '@/types';

import { useEffect, useState, useCallback } from 'react';

import { UploadBox } from '@/components/Chat/UploadBox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doGet, doPost } from '@/utils/http';
import { logError, logInfo, logWarn } from '@/utils/logger';

const metadata = {
    title: '内容发布 - 搜读',
};

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

    const onFileSelected = (file: File) => {
        console.log(categories, tags);
        logInfo(file);
    };

    return (
        <main className="pageBody">
            <div className="flex w-1/3 items-center justify-start">
                <UploadBox onFileSelected={onFileSelected} />
            </div>

            <div className="flex h-24 w-1/3 items-center justify-around">
                <Select>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="请选择内容分类" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {categories.map((tag: Tag, index: number) => (
                                <SelectItem key={`tg_${index}`} value={tag.value}>
                                    {tag.key}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="请选择内容标签" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {tags.map((tag: Tag, index: number) => (
                                <SelectItem key={`tg_${index}`} value={tag.value}>
                                    {tag.key}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex h-24 w-1/3 items-center justify-center">
                <Button type="submit" className="mr-2 h-11 w-1/3">
                    提交
                </Button>
            </div>
        </main>
    );
}
