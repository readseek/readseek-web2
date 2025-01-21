'use server';

import type { LSegment } from './langchain/parser';

// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';

import { onnxModelWith, OnnxModel } from '@/constants/onnx-model';
import { logError, logInfo } from '@/utils/logger';

import MilvusDB from './database/milvus';
import OptimizedTokenizer, { TokenizeResult } from './langchain/tokenizer';

let model: OnnxModel;
let session: any;
let tokenizer: OptimizedTokenizer;

export type EmbeddingTextItem = {
    number: number;
    text: string;
    embedding: Array<number>;
};

async function initialize() {
    if (!session) {
        try {
            model = onnxModelWith('similarity');
            session = await InferenceSession.create(model.path, {
                enableCpuMemArena: true,
                enableMemPattern: true,
                executionMode: 'parallel',
                graphOptimizationLevel: 'all',
                logLevel: 'warning',
                // 0: Verbose, 1: Info, 2: Warning, 3: Error, 4: Fatal
                logSeverityLevel: 2,
                // 0 means use all available threads
                interOpNumThreads: 0,
                intraOpNumThreads: 0,
            });
            if (!tokenizer && model.tokenizerPath) {
                tokenizer = new OptimizedTokenizer(model.tokenizerPath);
                logInfo('preTokenizer and its type are: ', tokenizer.getPreTokenizer());
            }
        } catch (error) {
            logError('initialize onnx model error: ', error);
        }
    }
}

export async function createEmbeddings(text: string | string[]): Promise<Array<EmbeddingTextItem> | null> {
    try {
        await initialize();

        const texts = Array.isArray(text) ? text : [text];

        // Tokenize the texts
        const tokenizers: TokenizeResult[] = await tokenizer.batchTokenizeWithoutCache(texts);

        // Run local inference
        return await Promise.all(
            tokenizers.map(async (cV: TokenizeResult, index: number) => {
                const inputFeeds = {
                    input_ids: new Tensor('int64', cV.inputIds, [1, cV.inputIds.length]),
                    attention_mask: new Tensor('int64', cV.attentionMask, [1, cV.attentionMask.length]),
                };
                const outputs = await session.run(inputFeeds);
                return {
                    number: index + 1,
                    text: texts[index],
                    embedding: Array.from(outputs?.sentence_embedding?.cpuData) as Array<number>,
                };
            }),
        );
    } catch (error) {
        logError('createEmbeddings', error);
    }
    return null;
}

export async function saveEmbeddings(segments: LSegment[], collectionName: string) {
    try {
        const contents: string[] = segments.map(segment => segment.pageContent);
        const textItems = await createEmbeddings(contents);
        if (Array.isArray(textItems) && textItems.length > 0) {
            const params = {
                textItems,
                dim: model.outputDimension,
                metas: segments.map(segment => segment.metadata),
            };
            return await MilvusDB.saveCollection(params, collectionName);
        }
    } catch (error) {
        logError('saveEmbeddings', error);
    }
    return false;
}

export async function deleteEmbeddings(collection: string) {
    return MilvusDB.deleteCollection(collection);
}

export async function searchEmbeddings(params: Record<string, any>) {
    return MilvusDB.searchCollection(params);
}

export async function queryEmbeddings(params: Record<string, any>) {
    return MilvusDB.queryCollection(params);
}
