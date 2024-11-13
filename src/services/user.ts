import type { User } from '@/types';
import type { OPCondition } from '@/utils/database/postgresql';
import type { NextRequest } from 'next/server';

import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import DBService from './db';

export default class UserService {
    @LogAPIRoute
    @CheckLogin
    static async login(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start login...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    static async update(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start update...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    static async cancel(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start cancel...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    static async profile(req: NextRequest): Promise<APIRet> {
        // TODO: 正式情况下，从拦截器中存放的变量获取
        const uid = Number(req.nextUrl.searchParams.get('uid'));
        const user = (await DBService.getUserInfo(uid)) as User;
        if (user) {
            return { code: 0, data: user, message: 'ok' };
        }
        return { code: 0, data: null, message: 'data not found' };
    }

    @LogAPIRoute
    @CheckLogin
    static async files(req: NextRequest): Promise<APIRet> {
        let user: User = { id: 1 };

        const searchParams = req.nextUrl.searchParams;

        const pageSize = Number(searchParams.get('pageSize')) || 10;
        const pageNum = Number(searchParams.get('pageNum')) || 1;
        // 根据标题模糊查询
        const title = searchParams.get('title');
        if (title && title.trim().length > 0) {
            user = Object.assign(user, {
                posts: [{ title: title }],
            });
        }

        const list = await DBService.getUserFiles({ title, pageSize, pageNum });
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no files found on given userId' };
    }
}
