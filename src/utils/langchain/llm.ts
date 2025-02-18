import { LRUCache } from 'lru-cache';
// @ts-ignore
import { InferenceSession } from 'onnxruntime-node';

import { ModelName, ModelType, OnnxModel, onnxModelWith } from '@/constants/onnx-model';

import { logInfo, logError } from '../logger';

import EnhancedTokenizer from './tokenizer';

export class LLMWrapper {
    public model: OnnxModel;
    public tokenizer: EnhancedTokenizer;
    public session?: any;

    constructor(type: ModelType, name?: ModelName) {
        this.model = onnxModelWith(type, name);
        this.tokenizer = new EnhancedTokenizer(this.model.tokenizerPath);
    }

    public async createInferenceSession() {
        try {
            this.session = await InferenceSession.create(this.model.path, {
                logLevel: 'warning',
                // 0: Verbose, 1: Info, 2: Warning, 3: Error, 4: Fatal
                logSeverityLevel: 3,
                // 0 means use all available threads
                interOpNumThreads: 0,
                intraOpNumThreads: 0,
                enableCpuMemArena: true,
                enableMemPattern: true,
                executionMode: 'parallel',
                graphOptimizationLevel: 'all',
            });
            return true;
        } catch (error) {
            logError('createInferenceSession error: ', error);
        }
        return false;
    }
}

export default class LLMFactory {
    static #cache: LRUCache<string, LLMWrapper> = new LRUCache({ max: 3, ttl: 1000 * 60 * 15 });

    public static async getInstance(type: ModelType, name?: ModelName): Promise<LLMWrapper | null> {
        try {
            if (this.#cache.has(type)) {
                const llm = this.#cache.get(type) as LLMWrapper;
                logInfo('Using cached LLM: ', name ?? llm.model.name);
                return llm;
            }
            const llm = new LLMWrapper(type, name);
            const ret = await llm.createInferenceSession();
            if (ret) {
                this.#cache.set(type, llm);
                return llm;
            }
        } catch (error) {
            logError(error);
        }
        return null;
    }
}
