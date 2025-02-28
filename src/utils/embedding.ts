'use server';

import type { DocumentSection } from './langchain/parser';
import type { DataArray, DataType, Tensor } from '@huggingface/transformers';
import type { SearchResults, SearchResultData } from '@zilliz/milvus2-sdk-node';

import { logError, logInfo, logWarn } from '@/utils/logger';

import MilvusDB from './database/milvus';
import PipelineManager from './langchain/pipeline';

export type TextEmbedding = {
    text: string;
    dims: number[];
    size: number;
    location: string;
    type: DataType;
    embedding: DataArray;
};

/**
 * https://milvus.io/docs/manage-collections.md
 * Collection and entity are similar to tables and records in relational databases.
 * In this project, every stand-alone file has its own Collection.
 */
const collectionNameWithId = (contentId: string): string => {
    return `RS_DOC_${contentId.toLocaleUpperCase()}`;
};

export async function createEmbedding(text: string | string[]): Promise<{ config: any; textEmbeddings: TextEmbedding[] } | null> {
    try {
        const extractor = await PipelineManager.getTaskLine('extractor');
        if (extractor) {
            const texts = Array.isArray(text) ? text : [text];
            const textEmbeddings: TextEmbedding[] = await Promise.all(
                texts.map(async text => {
                    // With pooling: "mean": You'd get a single 384-dimensional vector that represents the entire sentence
                    const item: Tensor = await extractor(text, { pooling: 'mean', normalize: true });
                    return {
                        text,
                        dims: item.dims,
                        size: item.size,
                        type: item.type,
                        location: item.location,
                        embedding: Array.from(item.data),
                    };
                }),
            );
            if (Array.isArray(textEmbeddings) && textEmbeddings.length > 0) {
                return {
                    textEmbeddings,
                    config: extractor.model.config,
                };
            }
        }
    } catch (error) {
        logError('createEmbedding', error);
    }
    return null;
}

export async function saveEmbedding(sections: DocumentSection[], cid: string) {
    try {
        const { texts, metas } = sections.reduce(
            (p: any, c: DocumentSection) => {
                if (c.pageContent) {
                    p.texts.push(c.pageContent);
                }
                if (c.metadata) {
                    p.metas.push(c.metadata);
                }
                return p;
            },
            { texts: [], metas: [] },
        );
        const result = await createEmbedding(texts);
        if (result) {
            return await MilvusDB.saveCollection({
                metas,
                embeddings: result.textEmbeddings,
                dim: result.config.hidden_size,
                collectionName: collectionNameWithId(cid),
            });
        }
    } catch (error) {
        logError('saveEmbedding', error);
    }
    return false;
}

export async function deleteEmbedding(cid: string) {
    return MilvusDB.deleteCollection(collectionNameWithId(cid));
}

export async function searchEmbedding(text: string, cid: string, similarityThreshold: number): Promise<{ data: string[]; matched: string[] } | null> {
    const result = await createEmbedding(text);
    if (result && Array.isArray(result.textEmbeddings)) {
        try {
            const rets: SearchResults = await MilvusDB.searchCollection({
                colName: collectionNameWithId(cid),
                vector: result.textEmbeddings[0].embedding,
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
                        }
                        return p;
                    },
                    { data: [] as string[], matched: [] as string[] },
                );
            }
            logWarn('searchEmbedding failed: ', rets.status);
        } catch (error) {
            logError(error);
        }
    }
    return null;
}
