import type { User } from '@/types';
import type { NextRequest } from 'next/server';

import { isDevModel, systemLog } from '@/utils/common';

import { getUserFiles, getUserInfo } from './db';

/**
 * 获取当前登陆用户的信息
 * @param {NextRequest} req
 * @returns {APIRet}
 */
export async function userProfile(req: NextRequest): Promise<APIRet> {
    // const cookies = req.cookies;
    // const headers = req.headers;
    // systemLog(0, cookies, headers);

    const user = (await getUserInfo({ id: 1 })) as User;
    if (user) {
        return { code: 0, data: user, message: 'userProfile success' };
    }
    return { code: 0, data: null, message: 'userProfile failed' };
}

/**
 * 获取当前用户上传的文档
 * @param {NextRequest} req
 * @returns {APIRet}
 */
export async function userFiles(req: NextRequest): Promise<APIRet> {
    const list = await getUserFiles(null);
    if (list) {
        return { code: 0, data: list, message: 'success' };
    }
    return { code: 0, data: [], message: 'no files found on given userId' };
}

export async function userLogin(req: NextRequest): Promise<APIRet> {
    return { code: 0, data: [], message: 'userLogin success' };
}

export async function userUpdate(req: NextRequest): Promise<APIRet> {
    return { code: 0, data: [], message: 'userUpdate success' };
}

export async function userCancellation(req: NextRequest): Promise<APIRet> {
    return { code: 0, data: [], message: 'userCancellation success' };
}
