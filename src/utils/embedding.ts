'use server';

import type { LSegment } from './langchain/parser';
import type { TokenizeResult } from './langchain/tokenizer';

// @ts-ignore
import { Tensor } from 'onnxruntime-node';

import { logError } from '@/utils/logger';

import MilvusDB from './database/milvus';
import LLMFactory from './langchain/llm';

export type EmbeddingTextItem = {
    number: number;
    text: string;
    embedding: Array<number>;
};

export async function createEmbedding(text: string | string[]): Promise<Array<EmbeddingTextItem> | null> {
    try {
        const llm = await LLMFactory.getInstance('similarity');
        if (llm) {
            // Tokenize the texts
            const texts = Array.isArray(text) ? text : [text];
            const tokenizers: TokenizeResult[] = await llm.tokenizer.batchTokenizeWithoutCache(texts);

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

export async function saveEmbedding(segments: LSegment[], collectionName: string) {
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
            return await MilvusDB.saveCollection(params, collectionName);
        }
    } catch (error) {
        logError('saveEmbedding', error);
    }
    return false;
}

export async function deleteEmbedding(collection: string) {
    return MilvusDB.deleteCollection(collection);
}

export async function searchEmbedding(params: Record<string, any>) {
    return MilvusDB.searchCollection(params);
}

export async function queryEmbedding(params: Record<string, any>) {
    return MilvusDB.queryCollection(params);
}
