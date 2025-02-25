import { existsSync } from 'node:fs';
import path from 'node:path';

import { env, pipeline, PreTrainedModel, PreTrainedTokenizer } from '@huggingface/transformers';
import { LRUCache } from 'lru-cache';

import { MODEL_ROOT_PATH } from '@/constants/config';
import { OnnxModel, HuggingFacePath } from '@/constants/onnx';

import { logError, logInfo } from '../logger';

env.allowRemoteModels = false;
env.localModelPath = MODEL_ROOT_PATH;

export const VALID_TASK_ALIASES = Object.freeze({
    extractor: 'feature-extraction',
    summarizer: 'summarization',
    asr: 'automatic-speech-recognition',
    tts: 'text-to-speech',
    qa: 'question-answering',
    dqa: 'document-question-answering',
    translator: 'translation',
    textGenerator: 'text-generation',
    t2tGenerator: 'text2text-generation',
});

export type TaskLine = {
    task: string;
    model: PreTrainedModel;
    tokenizer: PreTrainedTokenizer;
    processor?: any;
} & any;

export default class PipelineManager {
    static #pipelineCache: LRUCache<string, any> = new LRUCache({ max: 5, ttl: 1000 * 60 * 15 });

    private static autoSelectModel(task: string): { nameOrPath: string; option: any } {
        // find all valid model name
        const models = Object.keys(OnnxModel).filter(key => OnnxModel[key] === task);
        if (models.length > 0) {
            let nameOrPath, option;
            for (const name of models) {
                // checking if local file exists
                if (existsSync(path.join(MODEL_ROOT_PATH, `${name}/model.onnx`))) {
                    nameOrPath = name;
                    option = {
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
                    };
                    break;
                }
                // using remote source
                nameOrPath = HuggingFacePath(name as keyof typeof OnnxModel);
                option = {
                    device: 'auto',
                    cache_dir: MODEL_ROOT_PATH,
                    local_files_only: false,
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
                };
                break;
            }
            return { nameOrPath, option };
        }

        throw new Error('Unsupported task...');
    }

    /**
     * Get pipeline from valid task alias
     * @param {keyof typeof VALID_TASK_ALIASES} taskAlias
     * @returns {Promise<T>}
     */
    public static async getTaskLine(taskAlias: keyof typeof VALID_TASK_ALIASES): Promise<TaskLine> {
        try {
            const cached = this.#pipelineCache.get(taskAlias);
            if (cached) {
                return cached;
            }

            // get model name from task
            const task = VALID_TASK_ALIASES[taskAlias];
            const { nameOrPath, option } = this.autoSelectModel(task);

            // Use local first, if not exists, download from remote server...
            const lineTask = await pipeline(task, nameOrPath, option);
            this.#pipelineCache.set(taskAlias, lineTask);
            return lineTask;
        } catch (error) {
            logError(error);
        }
        return null;
    }
}
