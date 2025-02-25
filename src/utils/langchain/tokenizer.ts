'use server';

import { env, AutoTokenizer, PreTrainedTokenizer } from '@huggingface/transformers';

import { MODEL_ROOT_PATH } from '@/constants/config';

import { logError, logInfo } from '../logger';

env.allowRemoteModels = false;
env.localModelPath = MODEL_ROOT_PATH;

export default class EnhancedTokenizer {
    private tokenizer?: PreTrainedTokenizer;
    private constructor() {}

    public static async getInstance(nameOrPath: string) {
        try {
            const instance = new EnhancedTokenizer();
            instance.tokenizer = await AutoTokenizer.from_pretrained(nameOrPath, {
                local_files_only: true,
                cache_dir: MODEL_ROOT_PATH,
            });
            return instance;
        } catch (error) {
            logError(error);
        } finally {
            logInfo('Using PreTrainedModel: ', nameOrPath);
        }
        return undefined;
    }

    public encode(inputs: string | string[]): number[] {
        if (this.tokenizer) {
            throw new Error('null PreTrainedTokenizer exception');
        }

        try {
            if (Array.isArray(inputs)) {
                return inputs.map(text => this.encode(text)).flat();
            }

            if (typeof inputs === 'string' && inputs.length > 0) {
                return this.tokenizer!.encode(inputs);
            }
        } catch (error) {
            logError(error);
        }

        return [];
    }

    public decode(inputs: number[]): string {
        if (this.tokenizer) {
            throw new Error('null PreTrainedTokenizer exception');
        }

        return this.tokenizer!.decode(inputs);
    }

    public batchDecode(inputs: number[][]): string[] {
        if (this.tokenizer) {
            throw new Error('null PreTrainedTokenizer exception');
        }

        return this.tokenizer!.batch_decode(inputs);
    }

    public tokenize(text: string, options?: { pair: string; add_special_tokens: boolean }): string[] {
        if (this.tokenizer) {
            throw new Error('null PreTrainedTokenizer exception');
        }
        if (typeof text !== 'string' || !text) {
            throw new Error('null input text exception');
        }

        try {
            return this.tokenizer!.tokenize(text, options);
        } catch (error) {
            logError(error);
        }
        return [];
    }

    public async batchTokenize(texts: string[], batchSize = 32): Promise<string[]> {
        try {
            const batches: string[][] = [];
            for (let i = 0; i < texts.length; i += batchSize) {
                batches.push(texts.slice(i, i + batchSize));
            }
            const tokenizedBatches = await Promise.all(batches.map((batch: string[]) => batch.map((text: string) => this.tokenize(text))));
            return tokenizedBatches.flat(Infinity) as string[];
        } catch (error) {
            logError(error);
        }
        return [];
    }
}
