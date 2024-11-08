import type { Category, Tag, Document, User } from '@/types';

import LevelDB from '@/utils/database/leveldb';
import { RecordData, PrismaModelOption, saveOrUpdate, find, QueryPaging } from '@/utils/database/postgresql';
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
                    option: PrismaModelOption.upsert,
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

    static async getFiles(data: any, paging?: QueryPaging): Promise<RecordData> {
        return await find({
            model: 'Document',
            option: PrismaModelOption.findMany,
            data: [data],
        });
    }

    static async getUserFiles(data: User, paging?: QueryPaging): Promise<RecordData> {
        return await find(
            {
                model: 'Document',
                option: PrismaModelOption.findMany,
                data: [data],
            },
            paging,
        );
    }

    static async getUserInfo(data: User): Promise<RecordData> {
        return await find({
            model: 'User',
            option: PrismaModelOption.findUnique,
            data: [data],
        });
    }
}
