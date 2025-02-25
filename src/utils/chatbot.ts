import { LRUCache } from 'lru-cache';

import PipelineManager from './langchain/pipeline';
import { logError, logInfo, logWarn } from './logger';

export default class EnhancedChatbot {
    private static initialized: boolean = false;

    private static respCache: LRUCache<string, any>;
    private static taskLine: any;

    private static async initialize(): Promise<void> {
        if (!this.initialized) {
            const taskLine = await PipelineManager.getTaskLine('t2tGenerator');
            if (taskLine) {
                this.taskLine = taskLine;
                this.respCache = new LRUCache({ max: 512, ttl: 1000 * 60 * 5 });
                this.initialized = true;
                logInfo('EnhancedChatbot has been initialized');
            }
        }
    }

    private static async generateResponse(question: string, context: string): Promise<string> {
        if (!this.initialized || !this.taskLine) {
            throw new Error('LLM not initialized');
        }
        try {
            const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;

            const response = await this.taskLine(prompt, question);
            if (response) {
                logInfo('LLM Response:\n', response);
                return response;
            }
        } catch (error) {
            logError(error);
        }
        return '';
    }

    public static async processQuery(question: string, contexts: string[]): Promise<string> {
        try {
            await this.initialize();

            const cachedResponse = this.respCache.get(question);
            if (cachedResponse) {
                return cachedResponse as string;
            }

            const context = contexts.join('\n').slice(0, 4096);

            const botResponse = await this.generateResponse(question, context);
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
