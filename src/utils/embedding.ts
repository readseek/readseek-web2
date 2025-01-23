'use server';

import type { LSegment } from './langchain/parser';
import type { TokenizeResult } from './langchain/tokenizer';
import type { SearchResults } from '@zilliz/milvus2-sdk-node';

// @ts-ignore
import { Tensor } from 'onnxruntime-node';

import { ModelType } from '@/constants/onnx-model';
import { logError } from '@/utils/logger';

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
const collectionNameWithId = (fileId: string): string => {
    return `RS_DOC_${fileId.toLocaleUpperCase()}`;
};

export async function createEmbedding(text: string | string[], batch = true, modelType: ModelType = 'similarity'): Promise<Array<EmbeddingTextItem> | null> {
    try {
        const llm = await LLMFactory.getInstance(modelType);
        if (llm) {
            // Tokenize the texts
            const texts = Array.isArray(text) ? text : [text];
            const tokenizers: TokenizeResult[] = batch ? await llm.tokenizer.batchTokenizeWithCache(texts) : await llm.tokenizer.tokenize(texts);

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
                        embedding: Array.from(outputs?.sentence_embedding?.cpuData) as Array<number>,
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

export async function searchEmbedding(text: string, cid: string): Promise<SearchResults> {
    const textItems = await createEmbedding(text, false);
    if (Array.isArray(textItems) && textItems.length) {
        return MilvusDB.searchCollection({
            colName: collectionNameWithId(cid),
            vector: textItems[0].embedding,
            outPuts: ['text'],
        });
    }
    throw new Error(`invalid data while create embedding with input: ${text}`);
}
