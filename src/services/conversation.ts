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
            const convId = searchParams.get('id') as string;
            if (!convId) {
                return this.renderError('parameter is missing or incorrect');
            }

            const conv = (await getConversation({ where: { id: convId }, include: { messages: true } })) as Conversation;
            if (conv) {
                const doc = await getDocumentInfo(conv?.cid);
                if (!doc) {
                    return this.renderError('document not found');
                }
                return { code: 0, data: { doc, conv }, message: 'ok' };
            }
        } catch (error) {
            logError('initChat: ', error);
        }
        return { code: -1, data: null, message: 'chat start failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async start(req: NextRequest): Promise<APIRet> {
        try {
            const searchParams = req.nextUrl.searchParams;
            const cid = searchParams.get('cid') as string;
            if (!cid || cid.trim().length !== 64) {
                return this.renderError('parameter is missing or incorrect');
            }

            const uid = this.getSharedUid();
            const conv: any = await getConversation({ where: { cid, uid }, select: { id: true } });
            if (conv) {
                return { code: 0, data: conv, message: 'ok' };
            }

            const newConv = await saveOrUpdateConversation({
                cid,
                uid,
                gid: -1,
                name: '',
                prompt: '',
                createAt: `${Date.now()}`,
                updateAt: `${Date.now()}`,
            } as Conversation);

            logWarn('no conversation history yet! Create a new one: ', newConv);
            return { code: 0, data: newConv, message: 'ok' };
        } catch (error) {
            logError('initChat: ', error);
        }
        return { code: -1, data: null, message: 'chat start failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async chat(req: NextRequest): Promise<APIRet> {
        const { input, chatId, cid } = await req.json();
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
