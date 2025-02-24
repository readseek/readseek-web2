import { env, pipeline, PreTrainedModel, PreTrainedTokenizer } from '@huggingface/transformers';
import { LRUCache } from 'lru-cache';

import { MODEL_ROOT_PATH } from '@/constants/application';

import { logError, logInfo } from '../logger';

env.allowRemoteModels = false;
env.localModelPath = MODEL_ROOT_PATH;

export const VALID_TASK_ALIASES = Object.freeze({
    asr: 'automatic-speech-recognition',
    tts: 'text-to-speech',
    embeddings: 'feature-extraction',
    sentimentAnalysis: 'text-classification',
    summarize: 'summarization',
    txt2txtGen: 'text2text-generation',
    // text2imgGen: '',
});

export type TaskLine = {
    task: string;
    model: PreTrainedModel;
    tokenizer: PreTrainedTokenizer;
    processor?: any;
} & any;

export default class PipelineManager {
    static #pipelineCache: LRUCache<string, any> = new LRUCache({ max: 5, ttl: 1000 * 60 * 15 });

    /**
     * Get pipeline from valid task aliases
     * @param {keyof typeof VALID_TASK_ALIASES} task
     * @returns {Promise<T>}
     */
    public static async getTaskLine(task: keyof typeof VALID_TASK_ALIASES): Promise<TaskLine> {
        try {
            const cached = this.#pipelineCache.get(task);
            if (cached) {
                return cached;
            }

            const lineTask = await pipeline(VALID_TASK_ALIASES[task], 'all-MiniLM-L6-v2', {
                device: 'auto',
                subfolder: '',
                cache_dir: MODEL_ROOT_PATH,
                local_files_only: true,
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
            this.#pipelineCache.set(task, lineTask);
            return lineTask;
        } catch (error) {
            logError(error);
        }
        return null;
    }
}
