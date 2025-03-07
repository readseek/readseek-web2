'use server';

import type { Message, Conversation } from '@/models/Conversation';
import type { Document } from '@/models/Document';
import type { Tag } from '@/models/Tag';

import path from 'node:path';

import { RecordData, PrismaDBMethod, saveOrUpdate, find, remove, OPParams, OPCondition } from '@/utils/database/postgresql';
import { saveEmbedding, deleteEmbedding } from '@/utils/embedding';
import { parseFileContent } from '@/utils/langchain/parser';
import { logError, logInfo, logWarn } from '@/utils/logger';

import { getFileType } from '../common';

export type SOUDocParam = {
    fileHash: string;
    filePath: string;
    cateId: number;
    tags: any[];
};

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

export async function hasRecord(id: string | number, option: Pick<OPParams, 'model'>) {
    try {
        const entity = (await find({
            model: option.model,
            method: PrismaDBMethod.findUnique,
            condition: {
                select: {
                    id: true,
                },
                where: { id },
            },
        })) as any;
        if (entity && entity?.id === id) {
            logInfo('Has unique record: ', id);
            return true;
        }
    } catch (error) {
        logError(error);
    }
    return false;
}

export async function saveOrUpdateDocument(data: SOUDocParam): Promise<{ state: boolean; message?: string }> {
    try {
        const { fileHash, filePath, cateId, tags } = data;
        if (await hasRecord(fileHash, { model: 'Document' })) {
            return { state: false, message: 'same file content' };
        }

        const ext = path.parse(filePath).ext;
        const result = await parseFileContent(filePath, ext.substring(1).toLowerCase());
        if (result.code && result.meta && result.sections) {
            let saveRet: any = false;
            if (await saveEmbedding(result.sections, fileHash)) {
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
                            ...result.meta,
                        } as Document,
                    ],
                });
            }
            return { state: !!saveRet };
        }
        return { state: false, message: 'Document parsing failed' };
    } catch (error) {
        logError(error);
    }
    return { state: false, message: 'error on saving to db' };
}

export async function deleteFileStorage(id: string): Promise<boolean> {
    const [det1, det2] = await Promise.all([
        deleteEmbedding(id),
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
        logWarn('VectorDB clear failed', det1);
    }
    if (!det2) {
        logWarn('SQLDB clear failed', det2);
    }
    return det1 && det2;
}

export async function getDocumentInfo(id: string, condition?: OPCondition): Promise<RecordData> {
    if (!condition) {
        condition = {
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
                        bio: true,
                        name: true,
                        avatar: true,
                        email: false,
                        createdAt: false,
                    },
                },
            },
        };
    }
    return await find({
        model: 'Document',
        method: PrismaDBMethod.findUnique,
        condition: {
            ...condition,
            where: { id },
        },
    });
}

export async function saveOrUpdateConversation(conv: Conversation): Promise<Record<string, any> | null> {
    try {
        return await saveOrUpdate({
            model: 'Conversation',
            method: PrismaDBMethod.upsert,
            data: [
                {
                    ...conv,
                } as Conversation,
            ],
            condition: {
                where: { cid: conv.cid, uid: conv.uid },
                update: conv,
            },
        });
    } catch (error) {
        logError(error);
    }
    return null;
}

export async function getConversation(condition: OPCondition): Promise<RecordData> {
    try {
        return await find({
            model: 'Conversation',
            method: PrismaDBMethod.findUnique,
            condition: condition,
        });
    } catch (error) {
        logError(error);
    }
    return null;
}

export async function syncMessage(message: Message[], conversationId: string): Promise<boolean> {
    try {
        const result = await saveOrUpdate({
            model: 'Message',
            method: PrismaDBMethod.createManyAndReturn,
            data: message.map(msg => ({ ...msg, conversationId })),
        });
        return !!result;
    } catch (error) {
        logError(error);
    }
    return false;
}

export async function deleteConversations(params: { cid: string; uid: number }[]): Promise<boolean> {
    try {
        const conversations = await Promise.all(
            params.map(param =>
                find({
                    model: 'Conversation',
                    method: PrismaDBMethod.findMany,
                    condition: {
                        select: { id: true },
                        where: param,
                    },
                }),
            ),
        );
        const conversationIds = conversations?.map((item: any) => item?.list?.map(item => item?.id)).flat();

        if (conversationIds?.length) {
            await remove({
                model: 'Message',
                method: PrismaDBMethod.deleteMany,
                condition: {
                    where: {
                        conversationId: {
                            in: conversationIds,
                        },
                    },
                },
            });

            const result = await Promise.all(
                params.map(param =>
                    remove({
                        model: 'Conversation',
                        method: PrismaDBMethod.deleteMany,
                        condition: {
                            where: param,
                        },
                    }),
                ),
            );

            return result.every(r => r);
        }
    } catch (error) {
        logError(error);
    }
    return false;
}
