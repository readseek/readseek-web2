import type { NextRequest } from 'next/server';

import { LogAPIRoute, CheckLogin } from '@/utils/decorators';

export default class SystemService {
    @LogAPIRoute
    @CheckLogin
    static async allUsers(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'home success' };
    }

    @LogAPIRoute
    @CheckLogin
    static async allFiles(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'list success' };
    }

    @LogAPIRoute
    @CheckLogin
    static async devEnvs(req: NextRequest): Promise<APIRet> {
        const confs: Record<string, string> = {};
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('__RSN_')) {
                confs[key] = process.env[key] || '';
            }
        });
        return { code: 0, data: confs, message: 'systemConf success' };
    }
}
