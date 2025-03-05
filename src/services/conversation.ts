import { NextRequest } from 'next/server';

import { Conversation, Message, createMessageEntity } from '@/models/Conversation';
import EnhancedChatbot from '@/utils/chatbot';
import { getDocumentInfo, syncMessage, getConversation, saveOrUpdateConversation } from '@/utils/database';
import { searchEmbedding } from '@/utils/embedding';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logWarn } from '@/utils/logger';

import BaseService from './_base';

class ConversationService extends BaseService {
    @LogAPIRoute
    @CheckLogin
    async init(req: NextRequest): Promise<APIRet> {
        try {
            const searchParams = req.nextUrl.searchParams;
            const cid = searchParams.get('cid') as string;
            if (!cid || cid.trim().length !== 64) {
                return this.renderError('parameter is missing or incorrect');
            }

            const uid = this.getSharedUid();
            let [doc, conv] = await Promise.all([getDocumentInfo(cid), getConversation(cid, uid)]);
            if (!conv) {
                conv = {
                    cid,
                    uid,
                    gid: -1,
                    name: '',
                    prompt: '',
                    createAt: `${Date.now()}`,
                    updateAt: `${Date.now()}`,
                };
                const ret = await saveOrUpdateConversation(conv as Conversation);
                logWarn('no conversation history yet! Creating a new conversation...', ret);
            }

            return { code: 0, data: { doc, conv }, message: 'ok' };
        } catch (error) {
            logError('initChat: ', error);
        }
        return { code: -1, data: null, message: 'chat start failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async chat(req: NextRequest): Promise<APIRet> {
        const { input, cid, chatId } = await req.json();
        const msgBuff: Message[] = [];
        try {
            let botResponse = '';
            if (input && cid) {
                msgBuff.push(createMessageEntity({ role: 'human', content: input }));

                // search similar results in Milvus
                const similarMatches = await searchEmbedding(input, cid, 0.3);
                if (similarMatches && similarMatches?.length) {
                    // chat with contexts
                    botResponse = await EnhancedChatbot.processQuery(input, similarMatches);
                } else {
                    // chat with generator
                    botResponse = await EnhancedChatbot.processQuery(input);
                }

                const msgOut = createMessageEntity({
                    role: 'bot',
                    content: botResponse,
                    rags: null,
                });

                msgBuff.push(msgOut);

                return {
                    code: 0,
                    data: msgOut,
                    message: 'ok',
                };
            }
        } catch (error) {
            logError('chat service: ', error);
        } finally {
            await syncMessage(msgBuff, chatId);
        }
        return { code: -1, data: null, message: 'chat response failed' };
    }
}

const service: ConversationService = new ConversationService();

export default service;
