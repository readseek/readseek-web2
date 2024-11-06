/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { NextRequest, NextResponse } from 'next/server';

import DocumentService from '@/services/document';
import SystemService from '@/services/system';
import UserService from '@/services/user';

export const preferredRegion = 'auto';
export const runtime = 'nodejs';
export const maxDuration = 10;

const enum GET_URI {
    fileList = 'fileList',
    fileChat = 'fileChat',
    // user's info
    userFiles = 'userFiles',
    userProfile = 'userProfile',
    // only for dev and admin debug
    sys_env = 'sys_env',
    sys_files = 'sys_files',
    sys_users = 'sys_users',
}

const enum POST_URI {
    fileUpload = 'fileUpload',
    fileDelete = 'fileDelete',
    userLogin = 'userLogin',
    userUpdate = 'userUpdate',
    userCancellation = 'userCancellation',
}

/**
 * 处理错误请求
 */
async function Notfound(req?: NextRequest, ret?: APIRet) {
    return NextResponse.json(ret || { code: -1, message: 'resource not found' }, { status: 404 });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { action } = params;

    let ret: APIRet;
    switch (action as GET_URI) {
        case GET_URI.fileList:
            ret = await DocumentService.list(req);
            break;
        case GET_URI.fileChat:
            ret = await DocumentService.chat(req);
            break;
        case GET_URI.userFiles:
            ret = await UserService.files(req);
            break;
        case GET_URI.userProfile:
            ret = await UserService.profile(req);
            break;
        case GET_URI.sys_env:
            ret = await SystemService.devEnvs(req);
            break;
        case GET_URI.sys_files:
            ret = await SystemService.allFiles(req);
            break;
        case GET_URI.sys_users:
            ret = await SystemService.allUsers(req);
            break;
        default:
            return Notfound(req);
    }

    return NextResponse.json(ret, { status: 200 });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    const { action } = params;

    let ret: APIRet;
    switch (action as POST_URI) {
        case POST_URI.fileUpload:
            ret = await DocumentService.upload(req);
            break;
        case POST_URI.fileDelete:
            ret = await DocumentService.delete(req);
            break;
        case POST_URI.userLogin:
            ret = await UserService.login(req);
            break;
        case POST_URI.userUpdate:
            ret = await UserService.update(req);
            break;
        case POST_URI.userCancellation:
            ret = await UserService.cancel(req);
            break;
        default:
            return Notfound(req);
    }

    return NextResponse.json(ret, { status: 200 });
}
