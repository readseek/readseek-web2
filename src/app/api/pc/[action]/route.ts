/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { fileUpload } from '@/services/file';
import { home, list, systemConf, userUpdate } from '@/services/system';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 处理错误请求
 */
async function error(req?: NextRequest, ret?: APIRet) {
    return NextResponse.json(ret || { code: -1, message: 'server error' }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { action } = params;
    const routes: any = {
        home,
        list,
        systemConf,
    };

    if (routes[action]) {
        const ret: APIRet = await routes[action](req);
        return NextResponse.json(ret, { status: 200 });
    }
    return error(req);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    const { action } = params;
    const routes: any = {
        fileUpload,
        userUpdate,
    };

    if (routes[action]) {
        const ret: APIRet = await routes[action](req);
        return NextResponse.json(ret, { status: 200 });
    }

    return error(req);
}
