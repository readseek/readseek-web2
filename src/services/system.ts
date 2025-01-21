import type { NextRequest } from 'next/server';

import { onnxModelWith } from '@/constants/onnx-model';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';

class SystemService {
    @LogAPIRoute
    @CheckLogin
    async allUsers(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async allFiles(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async devEnvs(req: NextRequest): Promise<APIRet> {
        const confs: Record<string, string> = {};
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('__RSN_')) {
                confs[key] = process.env[key] || '';
            }
        });
        return { code: 0, data: confs, message: 'ok' };
    }

    async test(req: NextRequest): Promise<APIRet> {
        const parameter = req.nextUrl.searchParams.get('p');
        // @ts-ignore
        const model = onnxModelWith(parameter || 'similarity');
        return { code: 0, data: model, message: 'ok' };
    }
}

const service: SystemService = new SystemService();

export default service;
