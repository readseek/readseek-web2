import { systemLog } from '@/utils/common';
import prisma from '@/utils/database/prisma';

export type DBOptionParams = {
    id?: number | string;
    model: 'Category' | 'Tag' | 'Document' | 'User';
    data?: Record<string, any>;
};

export async function getList(param: DBOptionParams) {
    let docs;
    if (param.id) {
        docs = await prisma.document.findMany({
            // include: {
            //     userId: Number(userId),
            // }
        });
    } else {
        docs = await prisma.document.findMany();
    }
    return docs;
}

export async function getById(param: DBOptionParams) {
    const rets = await prisma.document.findMany({
        select: {
            id: true,
        },
    });

    systemLog(0, 'getById', rets);

    return true;
}

export async function saveOrUpdate(param: DBOptionParams) {
    systemLog(0, 'saveOrUpdate', param);

    // const rets = await prisma.document.findMany({
    //     select: {
    //         id: true,
    //     },
    // });
    // systemLog(0, 'getDocumentById', rets);

    return true;
}
