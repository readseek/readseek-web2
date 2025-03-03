import { LRUCache } from 'lru-cache';

import { generateText, generateWithContext } from '@/utils/langchain/generator';

import { logError, logInfo, logWarn } from './logger';

export default class EnhancedChatbot {
    private static initialized: boolean = false;

    private static respCache: LRUCache<string, any>;

    private static async initialize(): Promise<void> {
        try {
            if (!this.initialized) {
                this.respCache = new LRUCache({ max: 256, ttl: 1000 * 60 * 5 });
                this.initialized = true;
                logInfo('EnhancedChatbot has been initialized');
            }
        } catch (error) {
            logWarn(error);
        }
    }

    private static async generateResponse(question: string, context?: string): Promise<string> {
        if (!this.initialized) {
            throw new Error('LLM not initialized');
        }
        try {
            if (context && context.length) {
                const resps: any = await generateWithContext(question, context, {
                    topK: 5,
                });
                if (resps && resps?.length) {
                    // choose the highest score one
                    return (resps?.sort((a: any, b: any) => b.score - a.score).shift() as any)?.answer;
                }
                return resps?.answer as string;
            }

            const resps: any = await generateText(question, {
                maxTokens: 100,
            });
            if (resps && resps?.length) {
                return resps.map(data => data?.generated_text).join('');
            }
            return resps as string;
        } catch (error) {
            logError(error);
        }
        return '';
    }

    public static async processQuery(question: string, contexts?: string[]): Promise<string> {
        try {
            await this.initialize();

            const cachedResponse = this.respCache.get(question);
            if (cachedResponse) {
                return cachedResponse as string;
            }

            const botResponse = await this.generateResponse(question, contexts?.join('\n'));
            if (botResponse) {
                this.respCache.set(question, botResponse);
            }

            return botResponse;
        } catch (error) {
            logError(error);
        }
        return '';
    }
}
