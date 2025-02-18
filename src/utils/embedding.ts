'use server';

import type { LSegment } from './langchain/parser';
import type { TokenizeResult } from './langchain/tokenizer';
import type { SearchResults, SearchResultData } from '@zilliz/milvus2-sdk-node';

// @ts-ignore
import { Tensor } from 'onnxruntime-node';

import { ModelType } from '@/constants/onnx-model';
import { logError, logInfo, logWarn } from '@/utils/logger';

import MilvusDB from './database/milvus';
import LLMFactory from './langchain/llm';

export type EmbeddingTextItem = {
    number: number;
    text: string;
    embedding: Array<number>;
};

/**
 * https://milvus.io/docs/manage-collections.md
 * Collection and entity are similar to tables and records in relational databases.
 * In this project, every stand-alone file has its own Collection.
 */
const collectionNameWithId = (contentId: string): string => {
    return `RS_DOC_${contentId.toLocaleUpperCase()}`;
};

export async function createEmbedding(text: string | string[], batchCreate = true): Promise<Array<EmbeddingTextItem> | null> {
    try {
        const llm = await LLMFactory.getInstance('similarity');
        if (llm) {
            // Tokenize the texts
            const texts = Array.isArray(text) ? text : [text];
            const tokenizers: TokenizeResult[] = batchCreate ? await llm.tokenizer.batchTokenizeWithCache(texts) : await llm.tokenizer.tokenize(texts);

            // Run local inference
            return await Promise.all(
                tokenizers.map(async (cV: TokenizeResult, index: number) => {
                    const inputFeeds = {
                        input_ids: new Tensor('int64', cV.inputIds, [1, cV.inputIds.length]),
                        attention_mask: new Tensor('int64', cV.attentionMask, [1, cV.attentionMask.length]),
                    };
                    const outputs = await llm.session?.run(inputFeeds);
                    return {
                        number: index + 1,
                        text: texts[index],
                        embedding: Array.from(outputs?.sentence_embedding?.data) as Array<number>,
                    };
                }),
            );
        }
    } catch (error) {
        logError('createEmbedding', error);
    }
    return null;
}

export async function saveEmbedding(segments: LSegment[], cid: string) {
    try {
        const contents: string[] = segments.map(segment => segment.pageContent);
        const textItems = await createEmbedding(contents);
        if (Array.isArray(textItems) && textItems.length > 0) {
            const llm = await LLMFactory.getInstance('similarity');
            const params = {
                textItems,
                dim: llm?.model.outputDimension,
                metas: segments.map(segment => segment.metadata),
            };
            return await MilvusDB.saveCollection(params, collectionNameWithId(cid));
        }
    } catch (error) {
        logError('saveEmbedding', error);
    }
    return false;
}

export async function deleteEmbedding(cid: string) {
    return MilvusDB.deleteCollection(collectionNameWithId(cid));
}

export async function searchEmbedding(text: string, cid: string, similarityThreshold: number): Promise<{ data: string[]; matched: string[] }> {
    const textItems = await createEmbedding(text, false);
    if (Array.isArray(textItems) && textItems.length) {
        const rets: SearchResults = await MilvusDB.searchCollection({
            colName: collectionNameWithId(cid),
            vector: textItems[0].embedding,
            outPuts: ['text'],
        });
        if (rets.status.code === 0) {
            return rets.results.reduce(
                (p, c: SearchResultData) => {
                    if (c.text) {
                        p.data.push(c.text);
                        if (c.score > similarityThreshold) {
                            p.matched.push(c.text);
                        }
                        if (c.score > 0.5) {
                            logInfo('score: ', c.score, 'text: ', c.text);
                        }
                    }
                    return p;
                },
                { data: [] as string[], matched: [] as string[] },
            );
        }
        logWarn('searchEmbedding failed: ', rets.status);
    }
    throw new Error(`invalid data while create embedding with input: ${text}`);
}
