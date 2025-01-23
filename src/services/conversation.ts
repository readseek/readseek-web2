import { NextRequest } from 'next/server';

import { Conversation, Message, MessageAttitude, packingMessage } from '@/models/Conversation';
import EnhancedChatbot from '@/utils/chatbot';
import { getDocumentInfo } from '@/utils/database';
import LevelDB from '@/utils/database/leveldb';
import { searchEmbedding } from '@/utils/embedding';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import BaseService from './_base';

class ConversationService extends BaseService {
    private async syncMessage(cid: string, message: Message[]): Promise<boolean> {
        try {
            const uid = this.getSharedUid();
            const conHis: Conversation[] = await LevelDB.get(uid);
            const conI = conHis?.findIndex(item => item.cid === cid);
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
                const ret = await LevelDB.put(uid, conHis);
                logInfo('syncMessage result:', ret, message.map(e => e.content).join(' => '));
                return ret;
            }
        } catch (error) {
            logError(error);
        }
        return false;
    }

    @LogAPIRoute
    @CheckLogin
    async init(req: NextRequest): Promise<APIRet> {
        try {
            const { id } = await req.json();
            if (!id || id.trim().length !== 64) {
                return this.renderError('parameter id is missing or incorrect');
            }

            const doc = (await getDocumentInfo(id)) as Document;
            return { code: 0, data: doc, message: 'ok' };
        } catch (error) {
            logError('initChat: ', error);
        }
        return { code: -1, data: null, message: 'chat start failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async history(req: NextRequest): Promise<APIRet> {
        try {
            const searchParams = req.nextUrl.searchParams;
            const cid = searchParams.get('id') as string;
            if (cid && cid.length === 64) {
                const uid = this.getSharedUid();
                const conHis: Conversation[] = (await LevelDB.get(uid)) || [];
                let conv = conHis.find(item => item.cid === cid);
                if (!conv) {
                    logWarn('no conversation history yet! Creating a new conversation...');
                    const createAt = new Date().getTime();
                    conv = {
                        id: conHis.length + 1,
                        name: '',
                        cid,
                        uid,
                        gid: -1,
                        createAt,
                        updateAt: createAt,
                        prompt: '',
                        messages: [],
                    };
                    conHis.push(conv);
                    await LevelDB.put(uid, conHis);
                }
                return { code: 0, data: conv, message: 'ok' };
            }
        } catch (error) {
            logError(error);
        }
        return this.renderError('Illegal url parameter');
    }

    @LogAPIRoute
    @CheckLogin
    async chat(req: NextRequest): Promise<APIRet> {
        const { input, id } = await req.json();
        const messageBuff: Message[] = [];
        try {
            let botResponse = '';
            if (input && id) {
                messageBuff.push(packingMessage({ role: 'user', content: input }));
                // search similar results in Milvus and check if good match exists
                const { data, matched } = await searchEmbedding(input, id, 0.75);

                if (matched.length > 0) {
                    botResponse = matched.shift() as string;
                } else {
                    // use LLM to generate a response
                    botResponse = await EnhancedChatbot.processQuery(input, data);
                }

                const msgOut = packingMessage({
                    role: 'bot',
                    content: botResponse,
                    ma: MessageAttitude.none,
                    rags: null,
                });

                messageBuff.push(msgOut);

                return {
                    code: 0,
                    data: msgOut,
                    message: 'ok',
                };
            }
        } catch (error) {
            logError('chat service: ', error);
        } finally {
            this.syncMessage(id, messageBuff);
        }
        return { code: -1, data: null, message: 'chat response failed' };
    }
}

const service: ConversationService = new ConversationService();

export default service;
