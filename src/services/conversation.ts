import type { Message } from '@/models/Message';

import { NextRequest } from 'next/server';

import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError } from '@/utils/logger';

import BaseService from './_base';

export default class ConversationService extends BaseService {
    @LogAPIRoute
    @CheckLogin
    async history(req: NextRequest): Promise<APIRet> {
        try {
            const searchParams = req.nextUrl.searchParams;
            const cid = searchParams.get('id');
            if (cid && cid.length) {
                const ret: Message[] = await LevelDB.getSharedDB.get(cid);
                return { code: 0, data: ret, message: 'ok' };
            }
        } catch (error) {
            logError(error);
        }
        return this.renderError('Illegal url parameter');
    }

    @LogAPIRoute
    @CheckLogin
    async syncMessage(req: NextRequest): Promise<APIRet> {
        try {
            const { id, data } = await req.json();
            if (id && data) {
                const ret = await LevelDB.getSharedDB.put(id, data);
                return { code: 0, data: ret, message: 'ok' };
            }
        } catch (error) {
            logError(error);
        }
        return this.renderError('Illegal json parameter');
    }
}
