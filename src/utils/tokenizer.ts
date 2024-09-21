// import { BertWordPieceTokenizer } from '@turingscript/tokenizers';
// import LRU from 'lru-cache';

// export default class OptimizedTokenizer {
//     constructor(tokenizerPath, maxCacheSize = 1000) {
//         this.tokenizer = BertWordPieceTokenizer.fromJSON(tokenizerPath);
//         this.cache = new LRU({ max: maxCacheSize });
//     }

//     tokenize(texts: string | string[]) {
//         if (!Array.isArray(texts)) {
//             texts = [texts];
//         }

//         const results = texts.map(text => {
//             const cached = this.cache.get(text);
//             if (cached) {
//                 return cached;
//             }

//             const encoded = this.tokenizer.encode(text);
//             const result = {
//                 inputIds: encoded.ids,
//                 attentionMask: encoded.attentionMask,
//             };

//             this.cache.set(text, result);
//             return result;
//         });

//         return results.length === 1 ? results[0] : results;
//     }

//     batchTokenize(texts, batchSize = 32) {
//         const batches = [];
//         for (let i = 0; i < texts.length; i += batchSize) {
//             batches.push(texts.slice(i, i + batchSize));
//         }

//         return batches.flatMap(batch => this.tokenize(batch));
//     }
// }
