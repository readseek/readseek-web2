'use server';

import { DocumentType, Tag, Document } from '@/types';
import { RecordData, PrismaDBMethod, saveOrUpdate, find, remove } from '@/utils/database/postgresql';
import { deleteEmbeddings, saveEmbeddings } from '@/utils/embeddings';
import { parseFileContent } from '@/utils/langchain/parser';
import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * Not opened for API
 */
export default class DBService {
    static async saveOrUpdateDocument(data: any): Promise<{ state: boolean; message?: string }> {
        try {
            const { fileHash, filePath, cateId, tags, type } = data;
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
                logWarn('Same file has already been stored in database: ', fileHash, type);
                return { state: false, message: 'same file content' };
            }

            // TODO: 耗时操作，后续改成移步执行、成功后通过消息通知
            const { state, meta, segments } = await parseFileContent(filePath, DocumentType[type]);
            if (!state || !meta || !segments) {
                logWarn('parseFileContent result: ', state, meta);
                return { state: false, message: 'file parsing failed' };
            }

            const modeData = {
                id: fileHash,
                userId: 1,
                type,
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
            };

            logInfo('on saveOrUpdateDocument, modeData is: ', modeData);

            const [ret1, ret2] = await Promise.all([
                // save content embeddings
                saveEmbeddings(segments),
                // save supabase postgresql
                saveOrUpdate({
                    model: 'Document',
                    method: PrismaDBMethod.upsert,
                    data: [modeData],
                }),
            ]);

            logInfo(`results with saveOrUpdateDocument: [${ret1} -- ${ret2}]`);
            if (ret1 && ret2) {
                return { state: true };
            }
        } catch (error) {
            logError(error);
        }
        return { state: false, message: 'error on saving to db' };
    }

    static async getFiles(data: any): Promise<RecordData> {
        return await find({
            model: 'Document',
            method: PrismaDBMethod.findMany,
            condition: {
                paging: { pageNum: data.pageNum, pageSize: data.pageSize },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    description: true,
                    authors: true,
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

    static async getUserFiles(data: any): Promise<RecordData> {
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

    static async getUserInfo(id: number): Promise<RecordData> {
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

    static async getCategories(): Promise<RecordData> {
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

    static async getTags(): Promise<RecordData> {
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

    static async deleteFileStorage(id: string): Promise<boolean> {
        const [det1, det2] = await Promise.all([
            deleteEmbeddings(id),
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

    static async getDocumentInfo(id: string): Promise<RecordData> {
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
}
