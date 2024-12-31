import { NextRequest } from 'next/server';

import { Message } from '@/models/Message';
import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

export default class ConversationService {
    @LogAPIRoute
    @CheckLogin
    static async history(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    static async syncMessage(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }
}
