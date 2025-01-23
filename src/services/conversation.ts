import type { SearchResults } from '@zilliz/milvus2-sdk-node';

import { NextRequest } from 'next/server';

import { Conversation, Message, MessageAttitude, packingMessage } from '@/models/Conversation';
import { queryChat, getDocumentInfo } from '@/utils/database';
import LevelDB from '@/utils/database/leveldb';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import BaseService from './_base';

class ConversationService extends BaseService {
    private async syncMessage(cId: string, message: Message[]): Promise<boolean> {
        try {
            const uId = this.getSharedUid();
            const conHis: Conversation[] = await LevelDB.get(uId);
            const conI = conHis?.findIndex(item => item.cId === cId);
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
                const ret = await LevelDB.put(uId, conHis);
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
            const cId = searchParams.get('id') as string;
            if (cId && cId.length === 64) {
                const uId = this.getSharedUid();
                const conHis: Conversation[] = (await LevelDB.get(uId)) || [];
                let conv = conHis.find(item => item.cId === cId);
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
                    await LevelDB.put(uId, conHis);
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
            if (input && id) {
                messageBuff.push(packingMessage({ role: 'user', content: input }));
                const rets: SearchResults = await queryChat(input, id);
                if (rets.status.code === 0) {
                    logInfo(
                        `Matched #${input}# scores: `,
                        rets.results.map(r => r.score),
                    );
                    const relatedTexts = rets.results.filter(r => r.score > 0.35).map(r => r.text);
                    const msgOut = packingMessage({
                        role: 'bot',
                        content: relatedTexts.length > 0 ? relatedTexts[0] : '抱歉，暂未匹配到相关内容',
                        ma: MessageAttitude.default,
                        rags: relatedTexts.length > 0 ? relatedTexts.splice(1) : null,
                    });

                    messageBuff.push(msgOut);

                    return {
                        code: 0,
                        data: msgOut,
                        message: 'ok',
                    };
                }
                logWarn('chatSearch failed: \n', rets.status);
                return { code: -1, data: null, message: rets.status.reason };
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
