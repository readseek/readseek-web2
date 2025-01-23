import type { User } from '@/models/User';
import type { NextRequest } from 'next/server';

import { existsSync, unlink } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { UPLOAD_PATH } from '@/constants/application';
import { DocumentType } from '@/models/Document';
import { deleteFileStorage, getUserFiles, getUserInfo } from '@/utils/database';
import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logInfo } from '@/utils/logger';

import BaseService from './_base';

class UserService extends BaseService {
    @LogAPIRoute
    @CheckLogin
    async login(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start login...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async update(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start update...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async cancel(req: NextRequest): Promise<APIRet> {
        const params = await req.json();
        logInfo('start cancel...', params);
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async profile(req: NextRequest): Promise<APIRet> {
        const uid = this.getSharedUid();
        const user = (await getUserInfo(uid)) as User;
        if (user) {
            return { code: 0, data: user, message: 'ok' };
        }
        return { code: 0, data: null, message: 'data not found' };
    }

    @LogAPIRoute
    @CheckLogin
    async userFiles(req: NextRequest): Promise<APIRet> {
        let user: User = { id: this.getSharedUid() };

        const searchParams = req.nextUrl.searchParams;

        const pageSize = Number(searchParams.get('size')) || 10;
        const pageNum = Number(searchParams.get('page')) || 1;
        // TODO: Fuzzy query later
        const title = searchParams.get('title');
        if (title && title.trim().length > 0) {
            user = Object.assign(user, {
                posts: [{ title: title }],
            });
        }

        const list = await getUserFiles({ title, pageSize, pageNum });
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no files found on given userId' };
    }

    @LogAPIRoute
    @CheckLogin
    async fileDelete(req: NextRequest): Promise<APIRet> {
        const { id, type } = await req.json();
        try {
            // clear conversation message list
            const uid = this.getSharedUid();
            const messages = (await LevelDB.get(uid))?.filter(item => item.cid !== id);
            const r1 = await LevelDB.put(uid, messages);
            logInfo('message histories has been cleared');

            // clear embeddings and sql records
            const r2 = await deleteFileStorage(id);

            return { code: 0, data: r1 && r2, message: 'ok' };
        } catch (error) {
            logError('fileDelete: ', error);
        } finally {
            // delete raw file
            const fpath = path.join(UPLOAD_PATH, `${id}.${DocumentType[type]}`) || '';
            if (existsSync(fpath || '')) {
                promisify(unlink)(fpath);
                logInfo('Uploaded file has been deleted');
            }
        }
        return { code: -1, data: null, message: 'delete failed' };
    }
}

const service: UserService = new UserService();

export default service;
