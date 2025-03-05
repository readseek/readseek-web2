import type { NextRequest } from 'next/server';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Prompt } from '@/constants/prompt';
import { isDevModel } from '@/utils/common';
import { deleteConversations } from '@/utils/database';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { generateText, generateWithContext, generateSummarization } from '@/utils/langchain/generator';
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

        const { cid, uid } = await req.json();
        if (cid && uid) {
            const ret = await deleteConversations([{ cid, uid }]);
            return { code: 0, data: ret, message: 'ok' };
        }

        const data = readFileSync(path.join('/Users/tangkunyin/Downloads/TestFiles', 'Milvus.md'), 'utf8');
        try {
            // const description = await generateSummarization(data, { maxTokens: 100 });
            // const title = await generateWithContext(Prompt.templates.title, data, { topK: 5 });
            // const keywords = await generateWithContext(Prompt.templates.keywords, description, { topK: 5 });
            const text = await generateText('How can I get rich?', {
                maxTokens: 100,
            });
            return {
                code: 0,
                data: {
                    // description,
                    // length: description?.length || 0,
                    // title,
                    // keywords,
                    text,
                },
                message: 'ok',
            };
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
