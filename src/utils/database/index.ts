'use server';

import type { Document } from '@/models/Document';
import type { SearchResults, QueryResults } from '@zilliz/milvus2-sdk-node';

import path from 'node:path';

import { Tag } from '@/models/Tag';
import { RecordData, PrismaDBMethod, saveOrUpdate, find, remove } from '@/utils/database/postgresql';
import { createEmbedding, deleteEmbedding, queryEmbedding, saveEmbedding, searchEmbedding } from '@/utils/embedding';
import { parseFileContent } from '@/utils/langchain/parser';
import { logError, logInfo, logWarn } from '@/utils/logger';

import { getFileType } from '../common';

export type SOUDocParam = {
    fileHash: string;
    filePath: string;
    cateId: number;
    tags: any[];
};

/**
 * https://milvus.io/docs/manage-collections.md
 * Collection and entity are similar to tables and records in relational databases.
 * In this project, every stand-alone file has its own Collection.
 */
function collectionNameWithId(fileId: string): string {
    return `RS_DOC_${fileId.toLocaleUpperCase()}`;
}

export async function getFiles(data: any): Promise<RecordData> {
    return await find({
        model: 'Document',
        method: PrismaDBMethod.findMany,
        condition: {
            paging: { pageNum: data.pageNum, pageSize: data.pageSize },
            select: {
                id: true,
                title: true,
                type: true,
                lang: true,
                keywords: true,
                authors: true,
                description: true,
                coverUrl: true,
                viewCount: true,
            },
            where: {
                state: {
                    not: {
                        equals: 'FAILED',
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        },
    });
}

export async function getUserFiles(data: any): Promise<RecordData> {
    return await find({
        model: 'Document',
        method: PrismaDBMethod.findMany,
        condition: {
            paging: { pageNum: data.pageNum, pageSize: data.pageSize },
            select: {
                id: true,
                title: true,
                type: true,
                state: true,
                authors: true,
                keywords: true,
                viewCount: true,
                updatedAt: true,
            },
            orderBy: {
                viewCount: 'desc',
            },
        },
    });
}

export async function getUserInfo(id: number): Promise<RecordData> {
    return await find({
        model: 'User',
        method: PrismaDBMethod.findUnique,
        condition: {
            select: {
                name: true,
                age: true,
                email: true,
                avatar: true,
                bio: true,
                createdAt: true,
            },
            where: { id },
        },
    });
}

export async function getCategories(): Promise<RecordData> {
    return await find({
        model: 'Category',
        method: PrismaDBMethod.findMany,
        condition: {
            select: {
                id: true,
                name: true,
            },
            where: {
                AND: [
                    {
                        name: {
                            not: {
                                equals: '',
                            },
                        },
                    },
                    {
                        name: {
                            not: undefined,
                        },
                    },
                ],
            },
        },
    });
}

export async function getTags(): Promise<RecordData> {
    return await find({
        model: 'Tag',
        method: PrismaDBMethod.findMany,
        condition: {
            select: {
                id: true,
                name: true,
            },
            where: {
                AND: [
                    {
                        name: {
                            not: {
                                equals: '',
                            },
                        },
                    },
                    {
                        name: {
                            not: undefined,
                        },
                    },
                ],
            },
        },
    });
}

export async function saveOrUpdateDocument(data: SOUDocParam): Promise<{ state: boolean; message?: string }> {
    try {
        const { fileHash, filePath, cateId, tags } = data;
        const doc = (await find({
            model: 'Document',
            method: PrismaDBMethod.findUnique,
            condition: {
                select: {
                    id: true,
                },
                where: { id: fileHash },
            },
        })) as Document;
        logInfo('Has document record ==> ', doc);
        if (doc && doc?.id) {
            logWarn('Same file has already been stored in database: ', fileHash);
            return { state: false, message: 'same file content' };
        }

        const ext = path.parse(filePath).ext;
        // TODO: 耗时操作，后续改成移步执行、成功后通过消息通知
        const { state, meta, segments } = await parseFileContent(filePath, ext.substring(1).toLowerCase());
        if (!state || !meta || !segments) {
            return { state: false, message: 'file parsing failed' };
        }

        logInfo('Start inserting data to database...');
        console.time('🔱 Saving db costs:');

        let saveRet: any = false;
        if (await saveEmbedding(segments, collectionNameWithId(fileHash))) {
            // save supabase postgresql
            saveRet = await saveOrUpdate({
                model: 'Document',
                method: PrismaDBMethod.upsert,
                data: [
                    {
                        id: fileHash,
                        userId: 1,
                        type: getFileType(ext),
                        categoryId: cateId,
                        tags: tags.reduce((p: any, c: Tag) => {
                            if (!p.hasOwnProperty('connectOrCreate')) {
                                p['connectOrCreate'] = [];
                            }
                            p['connectOrCreate'].push({
                                where: { id: c.id },
                                create: { name: c.name, alias: c.alias },
                            });
                            return p;
                        }, {}),
                        ...meta,
                    } as Document,
                ],
            });
        }
        console.timeEnd('🔱 Saving db costs:');

        return { state: Boolean(saveRet) };
    } catch (error) {
        logError(error);
    }
    return { state: false, message: 'error on saving to db' };
}

export async function deleteFileStorage(id: string): Promise<boolean> {
    const [det1, det2] = await Promise.all([
        deleteEmbedding(collectionNameWithId(id)),
        remove({
            model: 'Document',
            method: PrismaDBMethod.deleteMany,
            condition: {
                where: {
                    id,
                },
            },
        }),
    ]);
    if (!det1) {
        logWarn('Embeddings clear failed', det1);
    }
    if (!det2) {
        logWarn('SQL DB clear failed', det2);
    }
    return det1 && det2;
}

export async function getDocumentInfo(id: string): Promise<RecordData> {
    return await find({
        model: 'Document',
        method: PrismaDBMethod.findUnique,
        condition: {
            select: {
                title: true,
                description: true,
                keywords: true,
                authors: true,
                coverUrl: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                tags: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true,
                        bio: true,
                        createdAt: true,
                    },
                },
            },
            where: { id },
        },
    });
}

export async function chatSearch(input: string, id: string): Promise<SearchResults> {
    const textItems = await createEmbedding(input, false);
    if (Array.isArray(textItems) && textItems.length) {
        return await searchEmbedding({
            colName: collectionNameWithId(id),
            vector: textItems[0].embedding,
            outPuts: ['text'],
        });
    }
    throw new Error(`invalid data while create embedding with input: ${input}`);
}

export async function chatQuery(input: string, id: string): Promise<QueryResults> {
    const textItems = await createEmbedding(input, false);
    if (Array.isArray(textItems) && textItems.length) {
        return await queryEmbedding({
            colName: collectionNameWithId(id),
            vector: textItems[0].embedding,
            outPuts: ['text', 'meta'],
        });
    }
    throw new Error(`invalid data while create embedding with input: ${input}`);
}
