'use server';

import type { LSegment } from './langchain/parser';
import type { SearchResults, SearchResultData } from '@zilliz/milvus2-sdk-node';

import { logError, logInfo, logWarn } from '@/utils/logger';

import MilvusDB from './database/milvus';
import PipelineManager from './langchain/pipeline';

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

export async function createEmbedding(text: string | string[]): Promise<Array<EmbeddingTextItem> | null> {
    try {
        const taskLine = await PipelineManager.getTaskLine('embeddings');
        if (taskLine) {
            const texts = Array.isArray(text) ? text : [text];
            return await Promise.all(
                texts.map(async (text: string, index: number) => {
                    return await taskLine(text);
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
            const params = {
                textItems,
                dim: 384,
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
    const textItems = await createEmbedding(text);
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
