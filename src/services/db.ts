'use server';

import { DocumentType, Category, Tag, Document, User } from '@/types';
import LevelDB from '@/utils/database/leveldb';
import { RecordData, PrismaDBMethod, saveOrUpdate, find } from '@/utils/database/postgresql';
import { deleteEmbeddings, parseAndSaveContentEmbedding } from '@/utils/embeddings';
import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * Not opened for API
 */
export default class DBService {
    static async saveOrUpdateDocument(data: any): Promise<boolean> {
        try {
            console.time('🔥 ParseAndSaveContent Costs:');
            const { fileHash, filePath, cateId, tags, type } = data;
            // TODO: 耗时操作，后续改成移步执行、成功后通过消息通知
            const parsedResult = await parseAndSaveContentEmbedding(filePath, DocumentType[type]);
            if (parsedResult.state) {
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
                    ...parsedResult.meta,
                };

                logInfo('on saveOrUpdateDocument, modeData is: ', modeData);

                const [ret1, ret2] = await Promise.all([
                    // save local mappings
                    LevelDB.getSharedDB.put(fileHash, filePath),
                    // save supabase postgresql
                    saveOrUpdate({
                        model: 'Document',
                        method: PrismaDBMethod.upsert,
                        data: [modeData],
                    }),
                ]);
                if (!ret1 || !ret2) {
                    logError(`error on saving to db: [${ret1} -- ${ret2}]`);
                    return false;
                }
                return true;
            }
            logWarn('parseAndSaveContent result: ', parsedResult);
        } catch (error) {
            logError(error);
        } finally {
            console.timeEnd('🔥 ParseAndSaveContent Costs:');
        }
        return false;
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
        const ret = await deleteEmbeddings('');

        return true;
    }
}
