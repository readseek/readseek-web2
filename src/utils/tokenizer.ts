import { Tokenizer } from '@turingscript/tokenizers';
import { LRUCache } from 'lru-cache';

export type TokenizeResult = { inputIds: number[]; attentionMask: number[] };

export default class OptimizedTokenizer {
    tokenizer: Tokenizer;
    cache: LRUCache<string, any>;

    constructor(tokenizerPath: string, maxCacheSize = 1000) {
        this.tokenizer = Tokenizer.fromFile(tokenizerPath);
        this.cache = new LRUCache({ max: maxCacheSize });
    }

    getPreTokenizer() {
        return this.tokenizer.getPreTokenizer();
    }

    async tokenize(texts: string | string[]): Promise<TokenizeResult[]> {
        if (!Array.isArray(texts)) {
            texts = [texts];
        }
        return Promise.all(
            texts.map(async text => {
                const cached = this.cache.get(text);
                if (cached) {
                    return cached;
                }

                const encoded = await this.tokenizer.encode(text, null, { isPretokenized: true, addSpecialTokens: true });
                const result = {
                    inputIds: encoded.getIds(),
                    attentionMask: encoded.getAttentionMask(),
                };

                this.cache.set(text, result);
                return result;
            }),
        );
    }

    async batchTokenize(texts: string[], batchSize = 32): Promise<TokenizeResult[]> {
        const batches: string[][] = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            batches.push(texts.slice(i, i + batchSize));
        }
        const tokenizedBatches = await Promise.all(batches.map(batch => this.tokenize(batch)));
        return tokenizedBatches.flat();
    }
}
