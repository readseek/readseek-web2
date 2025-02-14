'use server';

import type { JsEncoding, Tokenizer as TokenizerType } from '@turingscript/tokenizers';

import { existsSync, readFileSync } from 'node:fs';

import { LRUCache } from 'lru-cache';

import { logError, logInfo, logWarn } from '../logger';

// for reason: The request could not be resolved by Node.js from the importing module.
const { Tokenizer, BPE, WordPiece, WordLevel, Unigram } = require('@turingscript/tokenizers');

export type TokenizeResult = { inputIds: number[]; attentionMask: number[]; tokenTypeIds?: number[] };

export default class EnhancedTokenizer {
    private tokenizer?: TokenizerType;
    private cache?: LRUCache<string, any>;

    constructor(filePath: string) {
        try {
            if (existsSync(filePath || '')) {
                const tokenizerConfig = readFileSync(filePath || '', 'utf8');
                const { model, pre_tokenizer } = JSON.parse(tokenizerConfig);

                logInfo(`Tokenizer's model type: ${model.type}, preTokenizer: ${pre_tokenizer.type}`);

                switch (model.type) {
                    case 'WordPiece':
                        this.tokenizer = new Tokenizer(WordPiece.init(model.vocab));
                        break;
                    case 'WordLevel':
                        this.tokenizer = new Tokenizer(WordLevel.init(model.vocab));
                        break;
                    case 'Unigram':
                        this.tokenizer = new Tokenizer(Unigram.init(model.vocab));
                        break;
                    case 'BPE':
                        this.tokenizer = new Tokenizer(BPE.init(model.vocab, model.merges));
                        break;
                    default:
                        this.tokenizer = Tokenizer.fromString(tokenizerConfig);
                        break;
                }
                this.cache = new LRUCache({ max: 512, ttl: 1000 * 60 * 5 });
            } else {
                logWarn('Path for tokenizer.json is not exists.');
            }
        } catch (error) {
            logError('Error on creating EnhancedTokenizer: ', error);
        }
    }

    public getPreTokenizer() {
        return this.tokenizer?.getPreTokenizer();
    }

    public async encode(text: string) {
        return this.tokenizer?.encode(text, null, { isPretokenized: true, addSpecialTokens: true });
    }

    public async decode(ids: Array<number>, skipSpecialTokens: boolean) {
        return this.tokenizer?.decode(ids, skipSpecialTokens);
    }

    public async tokenize(texts: string[]): Promise<TokenizeResult[]> {
        return Promise.all(
            texts.map(async text => {
                const cached = this.cache?.get(text);
                if (cached) {
                    return cached;
                }

                const encoded = await this.encode(text);
                const result = {
                    inputIds: encoded?.getIds(),
                    attentionMask: encoded?.getAttentionMask(),
                    tokenTypeIds: encoded?.getTypeIds(),
                };

                this.cache?.set(text, result);
                return result;
            }),
        );
    }

    public async batchTokenize(texts: string[]): Promise<TokenizeResult[]> {
        try {
            if (this.tokenizer) {
                const encodings: JsEncoding[] = await this.tokenizer.encodeBatch(texts, { isPretokenized: true, addSpecialTokens: true });
                return encodings.map(r => ({
                    inputIds: r.getIds(),
                    attentionMask: r.getAttentionMask(),
                    tokenTypeIds: r.getTypeIds(),
                }));
            }
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
