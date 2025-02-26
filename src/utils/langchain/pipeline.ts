'use server';

import { existsSync } from 'node:fs';
import path from 'node:path';

import { env, pipeline, PreTrainedModel, PreTrainedTokenizer } from '@huggingface/transformers';
import { LRUCache } from 'lru-cache';

import { MODEL_ROOT_PATH } from '@/constants/config';
import { OnnxModel, HuggingFacePath, OnnxSessionOptions } from '@/constants/onnx';

import { logError, logInfo } from '../logger';

env.allowLocalModels = true;
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

type AutoSelectType = {
    nameOrPath: string;
    options: any;
};

export default class PipelineManager {
    static #pipelineCache: LRUCache<string, any> = new LRUCache({ max: 5, ttl: 1000 * 60 * 15 });

    private static autoSelectModel(task: string): AutoSelectType {
        // find all valid model name
        const models = Object.keys(OnnxModel).filter(key => OnnxModel[key] === task);
        if (models.length > 0) {
            for (let i = 0; i < models.length; i++) {
                const name = models[i];
                // check all of local models
                if (existsSync(path.join(MODEL_ROOT_PATH, `${name}/model.onnx`))) {
                    return {
                        nameOrPath: name,
                        options: {
                            device: 'auto',
                            subfolder: '',
                            model_file_name: 'model',
                            cache_dir: MODEL_ROOT_PATH,
                            local_files_only: true,
                            session_options: OnnxSessionOptions,
                            progress_callback: (info: any) => {
                                logInfo(info);
                            },
                        },
                    };
                }
                // none of local exists then using remote source
                if (i === models.length - 1) {
                    return {
                        nameOrPath: HuggingFacePath(name as keyof typeof OnnxModel),
                        options: {
                            device: 'auto',
                            cache_dir: MODEL_ROOT_PATH,
                            local_files_only: false,
                            session_options: OnnxSessionOptions,
                            progress_callback: (info: any) => {
                                logInfo(info);
                            },
                        },
                    };
                }
            }
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

            const task = VALID_TASK_ALIASES[taskAlias];
            const { nameOrPath, options } = this.autoSelectModel(task);

            // Use local first, if not exists, download from remote server...
            const lineTask = await pipeline(task, nameOrPath, options);
            this.#pipelineCache.set(taskAlias, lineTask);
            return lineTask;
        } catch (error) {
            logError(error);
        }
        return null;
    }
}
