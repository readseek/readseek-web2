import { NextRequest } from 'next/server';

import { Message } from '@/models/Message';
import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

export default class ConversationService {
    @LogAPIRoute
    @CheckLogin
    async history(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async syncMessage(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }
}
