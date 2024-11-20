import type { Category, Tag, Document, User } from '@/types';

import LevelDB from '@/utils/database/leveldb';
import { RecordData, PrismaDBMethod, saveOrUpdate, find, OPCondition } from '@/utils/database/postgresql';
import { deleteEmbeddings, parseAndSaveContentEmbedding } from '@/utils/embeddings';
import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * Not opened for API
 */
export default class DBService {
    static async saveOrUpdateDocument(data: any): Promise<boolean> {
        const { fileHash, filePath } = data;
        const parsedResult = await parseAndSaveContentEmbedding(filePath);
        if (parsedResult.state) {
            const [ret1, ret2] = await Promise.all([
                // save local mappings
                LevelDB.getSharedDB.put(fileHash, filePath),
                // save supabase postgresql
                saveOrUpdate({
                    model: 'Document',
                    method: PrismaDBMethod.upsert,
                    data: [
                        {
                            id: fileHash,
                            tags: [{ id: 1 }, { id: 5 }],
                            categoryId: 1,
                            userId: 1,
                            ...parsedResult.meta,
                        } as any,
                    ],
                }),
            ]);
            if (!ret1 || !ret2) {
                logError(`error on saving to db: [${ret1} -- ${ret2}]`);
                return false;
            }
            return true;
        }
        logError(`error on parseAndSaveContentEmbedding result: ${parsedResult}`);
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
                    description: true,
                    authors: true,
                    coverUrl: true,
                    viewCount: true,
                },
                where: {
                    state: 'SUCCESS',
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
                    avatarUrl: true,
                    bio: true,
                    createdAt: true,
                },
                where: { id },
            },
        });
    }
}
