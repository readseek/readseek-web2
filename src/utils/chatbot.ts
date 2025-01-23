import { LRUCache } from 'lru-cache';
// @ts-ignore
import { Tensor } from 'onnxruntime-node';

import LLMFactory, { LLMWrapper } from './langchain/llm';
import { logError, logInfo, logWarn } from './logger';

export default class EnhancedChatbot {
    private static initialized: boolean = false;

    private static respCache: LRUCache<string, any>;
    private static llm: LLMWrapper;

    private static async initialize(): Promise<void> {
        if (!this.initialized) {
            const modelInstance = await LLMFactory.getInstance('text-generation');
            if (modelInstance) {
                this.initialized = true;
                this.llm = modelInstance;
                this.respCache = new LRUCache({ max: 512, ttl: 1000 * 60 * 10 });
            }
        }
        logWarn(`EnhancedChatbot has ${this.initialize ?? 'not'} been initialized`);
    }

    private static async generateResponse(input: string, prompt: string): Promise<string> {
        if (!this.initialized || !this.llm) {
            throw new Error('Chat model not initialized');
        }
        try {
            // TODO: to be tested...
            const encodedInput: any = await this.llm.tokenizer.encode(input);
            const inputFeeds = {
                input_ids: new Tensor('int64', BigInt64Array.from(encodedInput), [1, encodedInput.length]),
                attention_mask: new Tensor('int64', BigInt64Array.from(new Array(encodedInput.length).fill(1)), [1, encodedInput.length]),
            };

            const output: any = await this.llm.session.run(inputFeeds);

            const response = await this.llm.tokenizer.decode(Array.from(output.logits.data), true);
            logInfo('Bot response', response);

            return response;
        } catch (error) {
            logError(error);
        }
        return '';
    }

    public static async processQuery(question: string, context: string[]): Promise<string> {
        try {
            await this.initialize();

            const cachedResponse = this.respCache.get(question);
            if (cachedResponse) {
                return cachedResponse as string;
            }

            const prompt = context.join('\n').slice(0, this.llm.model.maxContextLength);

            const botResponse = await this.generateResponse(question, prompt);
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
