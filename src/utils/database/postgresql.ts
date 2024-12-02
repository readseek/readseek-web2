'use server';

import type { Category, Tag, Document, User } from '@/types';

import { isDevModel } from '@/utils/common';
import prisma from '@/utils/database/prisma';
import { logError, logInfo, logWarn } from '@/utils/logger';

if (isDevModel()) {
    prisma.$on('query', e => {
        console.group(`DB Query: ${e.timestamp}`);
        console.log('Target: ' + e.target + ', ' + 'Query: ' + e.query + ', ' + 'Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
        console.groupEnd();
    });
}

// https://www.prisma.io/docs/orm/reference/prisma-client-reference#model-queries
export const enum PrismaDBMethod {
    upsert = 'upsert', // for a single create,update
    createManyAndReturn = 'createManyAndReturn',

    findFirst = 'findFirst',
    findMany = 'findMany',
    findUnique = 'findUnique',

    deleteMany = 'deleteMany', // delete one or more
    count = 'count',
}

// Prisma operator condition
export type OPCondition = {
    skipDuplicates?: boolean;
    create?: object;
    update?: object;
    select?: object;
    include?: object;
    where?: object;
    paging?: {
        pageSize: number;
        pageNum: number;
    };
    orderBy?: object;
};

// general parameters for CRUD
export type OPParams = {
    model: 'Category' | 'Tag' | 'Document' | 'User';
    method: PrismaDBMethod;
    data?: (Document | Category | Tag | User)[];
    condition?: OPCondition;
};

export type RecordData =
    | {
          list: (Category | Tag | Document | User)[];
          total: number;
      }
    | Category
    | Tag
    | Document
    | User
    | null;

const parseRealCondition = (data?: object): OPCondition => {
    try {
        if (data && typeof data === 'object') {
            return Object.keys(data).reduce((p: any, c: string) => {
                if (c === 'paging') {
                    p['take'] = data[c].pageSize;
                    p['skip'] = (data[c].pageNum - 1) * data[c].pageSize;
                } else {
                    p[c] = data[c];
                }
                return p;
            }, {});
        }
    } catch (error) {
        logError(`error on parseRealCondition, input is: ${data}`, error);
    }
    return {};
};

export async function count(param: OPParams): Promise<number> {
    const { model, condition } = param;

    const prismaModel: any = prisma[model.toLowerCase()];
    if (!prismaModel) {
        throw new Error(`Invalid model: ${model}`);
    }

    return await prismaModel.count({ where: condition?.where || {} });
}

/**
 * 获取一条或多条记录
 * @param {OPParams} 查询参数
 * @param {Condition} 查询条件
 * @returns {RecordData}
 */
export async function find(param: OPParams): Promise<RecordData> {
    const { model, method, condition } = param;
    const prismaModel: any = prisma[model.toLowerCase()];
    if (!prismaModel) {
        throw new Error(`Invalid model: ${model}`);
    }

    try {
        const cond: OPCondition = parseRealCondition(condition);
        logInfo('query condition: =>\n', cond);
        if (method === PrismaDBMethod.findFirst) {
            return await prismaModel.findFirst(cond);
        }
        if (method === PrismaDBMethod.findUnique) {
            return await prismaModel.findUnique(cond);
        }
        if (method === PrismaDBMethod.findMany) {
            const total = await count(param);
            if (total > 0) {
                const rets = await prismaModel.findMany(cond);
                return { total, list: rets };
            }
            logWarn('no data in :', model);
        }
    } catch (error) {
        logError('error on find: ', error);
    }

    return null;
}

/**
 * 多表增加、修改
 * 1、ID是否为空：为空是新增，否则是更新；
 * 2、对于涉及关联表的字段需要特别处理；
 * @param {OPParams} 其中，option 可选项仅为：createManyAndReturn、upsert
 * @returns {RecordData}
 */
export async function saveOrUpdate(param: OPParams): Promise<RecordData> {
    const { model, method, data, condition } = param;

    const prismaModel: any = prisma[model.toLowerCase()];
    if (!prismaModel) {
        throw new Error(`Invalid model: ${model}`);
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error(`Invalid data: ${data}`);
    }

    try {
        const cond: OPCondition = parseRealCondition(condition);
        cond.select = cond.select || { id: true };

        if (method === PrismaDBMethod.createManyAndReturn) {
            cond.skipDuplicates = cond.skipDuplicates ?? false;
            return await prismaModel.createManyAndReturn({ data, ...cond });
        }

        if (method === PrismaDBMethod.upsert) {
            const modelX = data[0] as any;

            cond.create = { ...modelX, ...(cond.create || {}) };
            if (modelX.hasOwnProperty('id')) {
                cond.where = { id: modelX.id, ...(cond.where || {}) };
                cond.update = { ...modelX, ...(cond.update || {}) };
            }

            logInfo('upsert condition: \n', cond);

            return await prismaModel.upsert(cond);
        }
    } catch (error) {
        logError('error on saveOrUpdate: ', error);
    }

    return null;
}

/**
 * 根据id删除一项或多项数据
 * @param {OPParams} 当前仅支持根据id删除
 * @returns {boolean}
 */
export async function remove(param: OPParams): Promise<boolean> {
    const { model, method, data } = param;

    const prismaModel: any = prisma[model.toLowerCase()];
    if (!prismaModel) {
        throw new Error(`Invalid model: ${model}`);
    }

    if (method !== PrismaDBMethod.deleteMany) {
        throw new Error(`Invalid method: ${method}`);
    }

    const args: any = {
        where: {
            // @ts-ignore
            id: data && data[0] ? data[0].id : undefined,
        },
    };

    const ret = await prismaModel.deleteMany(args);
    return ret && ret.count > 0;
}
