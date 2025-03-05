/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { NextRequest, NextResponse } from 'next/server';

import ConversationService from '@/services/conversation';
import FileService from '@/services/file';
import SystemService from '@/services/system';
import UserService from '@/services/user';
import { GET_URI, POST_URI } from '@/utils/http/index';

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
        case GET_URI.__test:
            ret = await SystemService.test(req);
            break;
        case GET_URI.__env:
            ret = await SystemService.sysEnvs(req);
            break;
        case GET_URI.__files:
            ret = await SystemService.sysFiles(req);
            break;
        case GET_URI.___users:
            ret = await SystemService.sysUsers(req);
            break;
        case GET_URI.convInit:
            ret = await ConversationService.init(req);
            break;
        case GET_URI.fileQuery:
            ret = await FileService.query(req);
            break;
        case GET_URI.fileList:
            ret = await FileService.list(req);
            break;
        case GET_URI.fileCategories:
            ret = await FileService.categoryList(req);
            break;
        case GET_URI.fileTags:
            ret = await FileService.tagList(req);
            break;
        case GET_URI.userFiles:
            ret = await UserService.userFiles(req);
            break;
        case GET_URI.userProfile:
            ret = await UserService.profile(req);
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
        case POST_URI.__test:
            ret = await SystemService.test_post(req);
            break;
        case POST_URI.convChat:
            ret = await ConversationService.chat(req);
            break;
        case POST_URI.fileUpload:
            ret = await FileService.upload(req);
            break;
        case POST_URI.fileDelete:
            ret = await UserService.fileDelete(req);
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
            return NextResponse.json({ code: -1, message: 'Notfound post' }, { status: 404 });
    }

    return NextResponse.json(ret, { status: BizHttpCode(ret) });
}
