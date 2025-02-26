import type { NextRequest } from 'next/server';

import { isDevModel } from '@/utils/common';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import PipelineManager from '@/utils/langchain/pipeline';
import { logError } from '@/utils/logger';

import BaseService from './_base';

class SystemService extends BaseService {
    @LogAPIRoute
    async test(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }
        const parameter = req.nextUrl.searchParams.get('p');

        return { code: 0, data: parameter, message: 'ok' };
    }

    @LogAPIRoute
    async test_post(req: NextRequest): Promise<APIRet> {
        if (!isDevModel()) {
            return this.renderError('Bad request');
        }

        const { data } = await req.json();
        if (!data) {
            return this.renderError('Bad input json');
        }

        try {
            const summarizer = await PipelineManager.getTaskLine('dqa');
            const results = await summarizer(data, {
                max_new_tokens: 200,
            });
            const response: string = results?.map((item: any) => item.summary_text).join('');

            return { code: 0, data: response, message: 'ok' };
        } catch (error) {
            logError(error);
        }

        return this.renderError('500`` request');
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
