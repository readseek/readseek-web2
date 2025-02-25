import type { NextRequest } from 'next/server';

import { onnxModelWith } from '@/constants/onnx';
import { isDevModel } from '@/utils/common';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';

import BaseService from './_base';

class SystemService extends BaseService {
    @LogAPIRoute
    async test(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }
        const parameter = req.nextUrl.searchParams.get('p');
        // @ts-ignore
        const model = onnxModelWith(parameter || 'similarity');
        return { code: 0, data: model, message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async sysUsers(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async sysFiles(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }
        return { code: 0, data: [], message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    async sysEnvs(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }
        const confs: Record<string, string> = {};
        Object.keys(process.env).forEach(key => {
            if (key.startsWith('__RSN_')) {
                confs[key] = process.env[key] || '';
            }
        });
        return { code: 0, data: confs, message: 'ok' };
    }
}

const service: SystemService = new SystemService();

export default service;
