import type { User } from '@/models/User';
import type { NextRequest } from 'next/server';

import { existsSync, unlink } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { UPLOAD_PATH } from '@/constants/application';
import { Conversation } from '@/models/Conversation';
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
        // TODO: 正式情况下，从拦截器中存放的变量获取
        const uid = Number(req.nextUrl.searchParams.get('uid'));
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
        // 根据标题模糊查询
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
        const jsonData = await req.json();
        if (!jsonData || !jsonData?.id) {
            return this.renderError('no file id found');
        }

        try {
            const { id, type } = jsonData;
            // 清理数据库
            const ret = await deleteFileStorage(id);
            if (ret) {
                // 清理已上传的文件
                const fpath = path.join(UPLOAD_PATH, `${id}.${DocumentType[type]}`) || '';
                if (existsSync(fpath || '')) {
                    promisify(unlink)(fpath);
                    logInfo('uploaded file has been deleted');
                }
                // 清理消息记录
                const uId = this.getSharedUid();
                const messages = (await LevelDB.get(uId))?.filter(item => item.cId !== id);
                await LevelDB.put(uId, messages);
                logInfo('message histories has been cleared');

                return { code: 0, data: null, message: 'ok' };
            }
        } catch (error) {
            logError('fileDelete: ', error);
        }
        return { code: -1, data: null, message: 'delete failed' };
    }
}

const service: UserService = new UserService();

export default service;
