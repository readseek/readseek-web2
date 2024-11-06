import type { NextRequest } from 'next/server';

export default class SystemService {
    static async allUsers(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'home success' };
    }

    static async allFiles(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: [], message: 'list success' };
    }

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
