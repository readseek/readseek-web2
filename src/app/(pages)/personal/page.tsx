import type { User } from '@/types';
import type { Metadata } from 'next';

import { NodataImage } from '@/components/ImageView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { doGet } from '@/utils/http';

export const metadata: Metadata = {
    title: '用户中心 - 搜读',
};

export default async function PersonalPage() {
    const data: User = await doGet('/api/web/userProfile?uid=1');
    return (
        <main className="pageBody">
            {data && data.email ? (
                <ul className="grid w-1/3 grid-rows-4 gap-4">
                    <li className="flex items-center justify-between">
                        <Label htmlFor="avatar" className="w-28">
                            头像
                        </Label>
                        <Avatar className="ml-4">
                            <AvatarImage src={data.avatarUrl} alt={`@${data.avatarUrl}`} />
                            <AvatarFallback>avatar</AvatarFallback>
                        </Avatar>
                    </li>
                    <li className="flex items-center justify-between">
                        <Label htmlFor="email" className="w-28">
                            电邮
                        </Label>
                        <Input type="email" id="email" placeholder={data.email} disabled />
                    </li>
                    <li className="flex items-center justify-between">
                        <Label htmlFor="avatar" className="w-28">
                            简介
                        </Label>
                        <Textarea placeholder="个人简介" rows={3} className="resize-none" defaultValue={data.bio} />
                    </li>
                    <li className="flex items-center justify-between">
                        <Label htmlFor="share-mode" className="w-28">
                            数据共享
                        </Label>
                        <Switch id="share-mode" />
                    </li>
                    <li className="flex items-center justify-evenly">
                        <Button variant="default" type="submit">
                            更新信息
                        </Button>
                        <Button variant="destructive" type="button">
                            账户注销
                        </Button>
                    </li>
                </ul>
            ) : (
                <NodataImage />
            )}
        </main>
    );
}
