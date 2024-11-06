import type { User } from '@/types';
import type { NextRequest } from 'next/server';

import { isDevModel, systemLog } from '@/utils/common';

import DBService from './db';

export default class UserService {
    static async profile(req: NextRequest): Promise<APIRet> {
        const user = (await DBService.getUserInfo({ id: 1 })) as User;
        if (user) {
            return { code: 0, data: user, message: 'userProfile success' };
        }
        return { code: 0, data: null, message: 'userProfile failed' };
    }

    static async files(req: NextRequest): Promise<APIRet> {
        const searchParams = req.nextUrl.searchParams;

        const title = searchParams.get('title');
        const authors = searchParams.get('authors');

        const pageSize = Number(searchParams.get('pageSize'));
        const pageNum = Number(searchParams.get('pageNum'));

        const list = await DBService.getUserFiles(
            {
                id: 1,
            },
            { pageSize, pageNum },
        );
        if (list) {
            return { code: 0, data: list, message: 'success' };
        }
        return { code: 0, data: [], message: 'no files found on given userId' };
    }

    static async login(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'userLogin success' };
    }

    static async update(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'userUpdate success' };
    }

    static async cancel(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'userCancellation success' };
    }
}
