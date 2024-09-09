'use client';

import { UploadBox } from '@/components/Chat/UploadBox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud } from 'lucide-react';
import { useEffect } from 'react';

const metadata = {
    title: '内容发布 - 搜读',
};

export default function PostContentPage() {
    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const onFileSelected = (file: File) => {
        console.log(file);
    };

    return (
        <main className="pageBody">
            <div className="flex w-1/3 items-center justify-start">
                <UploadBox onFileSelected={onFileSelected} />
            </div>

            <div className="flex h-24 w-1/3 items-center justify-start">
                <Label htmlFor="picture" className="w-28">
                    内容标签：
                </Label>
                <Select>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="选择内容类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="auto">自动推断</SelectItem>
                            <SelectItem value="news">事实新闻</SelectItem>
                            <SelectItem value="technology">科学技术</SelectItem>
                            <SelectItem value="history">历史人文</SelectItem>
                            <SelectItem value="finance">金融理财</SelectItem>
                            <SelectItem value="language">语言学习</SelectItem>
                            <SelectItem value="essays">小说杂文</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex h-24 w-1/3 items-center justify-start">
                <Button type="submit">
                    <UploadCloud className="mr-2 h-4 w-4" /> 发布
                </Button>
            </div>
        </main>
    );
}
