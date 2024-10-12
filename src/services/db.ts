import { systemLog } from '@/utils/common';
import prisma from '@/utils/database/prisma';

/**
 * test for mock api
 * @returns mock data
 */
export async function getTest(all: true): Promise<APIRet> {
    let rets;
    if (all) {
        rets = await prisma.user.findMany();
    } else {
        rets = await prisma.user.findMany({
            // Add other fields you need
            select: {
                id: true,
                name: true,
            },
        });
    }

    systemLog(0, rets);

    return { code: 0, data: rets, message: 'getTest success' };
}
