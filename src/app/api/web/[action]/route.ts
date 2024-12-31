/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { NextRequest, NextResponse } from 'next/server';

import { GET_URI, POST_URI } from '@/constants/application';
import DocumentService from '@/services/document';
import SystemService from '@/services/system';
import UserService from '@/services/user';

export const preferredRegion = 'auto';
export const runtime = 'nodejs';
export const maxDuration = 10;

const BizHttpCode = (ret: APIRet) => {
    switch (ret.code) {
        case -1:
        case 0:
            return 200;
        case 1:
            return 401;
        default:
            return 500;
    }
};

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { action } = params;

    let ret: APIRet;
    switch (action as GET_URI) {
        case GET_URI.fileCategories:
            ret = await DocumentService.categoryList(req);
            break;
        case GET_URI.fileTags:
            ret = await DocumentService.tagList(req);
            break;
        case GET_URI.fileList:
            ret = await DocumentService.list(req);
            break;
        case GET_URI.initChat:
            ret = await DocumentService.initChat(req);
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
            return NextResponse.json({ code: -1, message: 'Notfound get' }, { status: 404 });
    }

    return NextResponse.json(ret, { status: BizHttpCode(ret) });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    const { action } = params;

    let ret: APIRet;
    switch (action as POST_URI) {
        case POST_URI.userLogin:
            ret = await UserService.login(req);
            break;
        case POST_URI.userUpdate:
            ret = await UserService.update(req);
            break;
        case POST_URI.userCancellation:
            ret = await UserService.cancel(req);
            break;
        case POST_URI.fileSearch:
            ret = await DocumentService.fileSearch(req);
            break;
        case POST_URI.fileQuery:
            ret = await DocumentService.fileQuery(req);
            break;
        case POST_URI.fileUpload:
            ret = await DocumentService.upload(req);
            break;
        case POST_URI.fileDelete:
            ret = await DocumentService.delete(req);
            break;
        default:
            return NextResponse.json({ code: -1, message: 'Notfound post' }, { status: 404 });
    }

    return NextResponse.json(ret, { status: BizHttpCode(ret) });
}
