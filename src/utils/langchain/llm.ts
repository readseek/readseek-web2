import { AutoModel } from '@huggingface/transformers';
import { LRUCache } from 'lru-cache';

import { MODEL_ROOT_PATH } from '@/constants/config';
import { ModelName, ModelType, OnnxModel, onnxModelWith } from '@/constants/onnx';

import { logInfo, logError } from '../logger';

import EnhancedTokenizer from './tokenizer';

export class LLMWrapper {
    public model: OnnxModel;
    public tokenizer?: EnhancedTokenizer;
    public session?: any;

    constructor(type: ModelType, name?: ModelName) {
        this.model = onnxModelWith(type, name);
    }

    public async initialize() {
        try {
            this.tokenizer = await EnhancedTokenizer.getInstance(this.model.tokenizerPath);
            this.session = await AutoModel.from_pretrained(this.model.path, {
                device: 'auto',
                cache_dir: MODEL_ROOT_PATH,
                local_files_only: true,
                use_external_data_format: true,
                session_options: {
                    enableCpuMemArena: true,
                    enableMemPattern: true,
                    executionMode: 'parallel',
                    enableGraphCapture: true,
                    graphOptimizationLevel: 'all',
                    // 0 means use all available threads
                    interOpNumThreads: 0,
                    intraOpNumThreads: 0,
                    logSeverityLevel: 3,
                },
                progress_callback: (info: any) => {
                    logInfo(info);
                },
            });
            return true;
        } catch (error) {
            logError('initialize error: ', error);
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
            const ret = await llm.initialize();
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
