import type { User } from '@/models/User';
import type { Metadata } from 'next';

import { NodataImage } from '@/components/ImageView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GET_URI } from '@/utils/http';
import { getServerData } from '@/utils/http/server';

export const metadata: Metadata = {
    title: '用户中心 - 搜读',
};

export default async function PersonalPage(props) {
    const ret: any = await getServerData(GET_URI.userProfile, { uid: 1 });
    const user: User = ret?.data as User;
    return (
        <div className="main-content">
            {!ret || ret?.code ? (
                <NodataImage />
            ) : (
                <ul className="grid w-1/2 grid-rows-4 gap-4">
                    <li className="flex items-center justify-between">
                        <Label className="w-28">名称</Label>
                        <div className="flex items-center justify-end">
                            <span className="text-slate-800s">{user.name}</span>
                            <Avatar className="ml-4">
                                <AvatarImage src={user.avatar} alt={`@${user.avatar}`} />
                                <AvatarFallback>avatar</AvatarFallback>
                            </Avatar>
                        </div>
                    </li>
                    <li className="flex items-center justify-between">
                        <Label htmlFor="email" className="w-28">
                            电邮
                        </Label>
                        <Input id="email" type="email" placeholder={user.email} disabled />
                    </li>
                    <li className="flex items-center justify-between">
                        <Label htmlFor="bio" className="w-28">
                            简介
                        </Label>
                        <Textarea id="bio" placeholder="个人简介" rows={4} className="resize-none" defaultValue={user.bio} />
                    </li>
                    <li className="flex items-center justify-between">
                        <Label className="w-28">创建时间</Label>
                        <span className="text-slate-800s">{new Date(user.createdAt!).toUTCString()}</span>
                    </li>
                    <li className="flex items-center justify-evenly">
                        <Button variant="default" type="submit" disabled>
                            更新信息
                        </Button>
                        <Button variant="destructive" type="button">
                            账户注销
                        </Button>
                    </li>
                </ul>
            )}
        </div>
    );
}
