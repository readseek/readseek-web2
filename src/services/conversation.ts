import { NextRequest } from 'next/server';

import { Conversation, Message, packingMessage } from '@/models/Conversation';
import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import BaseService from './_base';

class ConversationService extends BaseService {
    @LogAPIRoute
    @CheckLogin
    async history(req: NextRequest): Promise<APIRet> {
        try {
            const searchParams = req.nextUrl.searchParams;
            const cId = searchParams.get('id') as string;
            if (cId && cId.length === 64) {
                const uId = this.getSharedUid();
                const conHis: Conversation[] = (await LevelDB.getSharedDB.get(uId)) || [];
                let conv = conHis.find(item => (item.cId = cId));
                if (!conv) {
                    logWarn('no conversation history yet! Creating a new conversation...');
                    const createAt = new Date().getTime();
                    conv = {
                        id: conHis.length + 1,
                        name: '',
                        cId,
                        uId,
                        gId: -1,
                        createAt,
                        updateAt: createAt,
                        prompt: '',
                        messages: [],
                    };
                    conHis.push(conv);
                    await LevelDB.getSharedDB.put(uId, conHis);
                }
                return { code: 0, data: conv, message: 'ok' };
            }
        } catch (error) {
            logError(error);
        }
        return this.renderError('Illegal url parameter');
    }

    async syncMessage(cId: string, message: Message[]): Promise<boolean> {
        try {
            const uId = this.getSharedUid();
            const conHis: Conversation[] = await LevelDB.getSharedDB.get(uId);
            const conI = conHis?.findIndex(item => (item.cId = cId));
            if (conI !== -1) {
                const conv = conHis[conI];
                if (!conv.messages) {
                    conv.messages = [];
                }
                conHis[conI] = {
                    ...conv,
                    updateAt: new Date().getTime(),
                    messages: conv.messages.concat(message),
                };
                const ret = await LevelDB.getSharedDB.put(uId, conHis);
                logInfo('syncMessage result:', ret, message.map(e => e.content).join(' => '));
                return ret;
            }
        } catch (error) {
            logError(error);
        }
        return false;
    }
}

const service: ConversationService = new ConversationService();

export default service;
