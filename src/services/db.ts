import { isDevModel, systemLog } from '@/utils/common';
import LevelDB from '@/utils/database/leveldb';
import { PrismaModelOption, saveOrUpdate } from '@/utils/database/postgresql';
import { deleteEmbeddings, parseAndSaveContentEmbedding } from '@/utils/embeddings';

export async function saveOrUpdateDocument(data: any): Promise<boolean> {
    const { fileHash, filePath } = data;
    const parsedResult = await parseAndSaveContentEmbedding(filePath);
    if (parsedResult.state) {
        const [ret1, ret2] = await Promise.all([
            // save local mappings
            LevelDB.getSharedDB.put(fileHash, filePath),
            // save supsbase postgresql
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
        if (!ret1 || !ret2.data) {
            systemLog(-1, `error on saving to db: [${ret1} -- ${ret2.message || ret2}]`);
            return false;
        }
        return true;
    }
    systemLog(-1, `error on parseAndSaveContentEmbedding result: ${parsedResult}`);
    return false;
}
