'use server';

import type { JsEncoding, Tokenizer as TokenizerType } from '@turingscript/tokenizers';

import { LRUCache } from 'lru-cache';

import { logError } from '../logger';

// for reason: The request could not be resolved by Node.js from the importing module.
const { Tokenizer } = require('@turingscript/tokenizers');

export type TokenizeResult = { inputIds: number[]; attentionMask: number[]; tokenTypeIds?: number[] };

export default class EnhancedTokenizer {
    private cache: LRUCache<string, any>;
    private tokenizer: TokenizerType;

    constructor(filePath: string) {
        this.cache = new LRUCache({ max: 1000, ttl: 1000 * 60 * 5 });
        this.tokenizer = Tokenizer.fromFile(filePath);
    }

    public getPreTokenizer() {
        return this.tokenizer.getPreTokenizer();
    }

    public async encode(text: string) {
        return this.tokenizer.encode(text, null, { isPretokenized: true, addSpecialTokens: true });
    }

    public async decode(ids: Array<number>, skipSpecialTokens: boolean) {
        return this.tokenizer.decode(ids, skipSpecialTokens);
    }

    public async tokenize(texts: string[]): Promise<TokenizeResult[]> {
        return Promise.all(
            texts.map(async text => {
                const cached = this.cache.get(text);
                if (cached) {
                    return cached;
                }

                const encoded = await this.encode(text);
                const result = {
                    inputIds: encoded.getIds(),
                    attentionMask: encoded.getAttentionMask(),
                    tokenTypeIds: encoded.getTypeIds(),
                };

                this.cache.set(text, result);
                return result;
            }),
        );
    }

    public async batchTokenize(texts: string[]): Promise<TokenizeResult[]> {
        try {
            const encodings: JsEncoding[] = await this.tokenizer.encodeBatch(texts, { isPretokenized: true, addSpecialTokens: true });
            return encodings.map(r => ({
                inputIds: r.getIds(),
                attentionMask: r.getAttentionMask(),
                tokenTypeIds: r.getTypeIds(),
            }));
        } catch (error) {
            logError(error);
        }
        return [];
    }

    public async batchTokenizeWithCache(texts: string[], batchSize = 32): Promise<TokenizeResult[]> {
        try {
            const batches: string[][] = [];
            for (let i = 0; i < texts.length; i += batchSize) {
                batches.push(texts.slice(i, i + batchSize));
            }
            const tokenizedBatches = await Promise.all(batches.map(batch => this.tokenize(batch)));
            return tokenizedBatches.flat();
        } catch (error) {
            logError(error);
        }
        return [];
    }
}
