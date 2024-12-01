import type { NextRequest } from 'next/server';

import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

import { getFileHash } from '@/utils/common';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import DBService from './db';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

const ErrorRet = (msg: string) => {
    return { code: -1, data: false, message: msg } as APIRet;
};

export default class DocumentService {
    @LogAPIRoute
    static async categoryList(req: NextRequest): Promise<APIRet> {
        const list = await DBService.getCategories();
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    static async tagList(req: NextRequest): Promise<APIRet> {
        const list = await DBService.getTags();
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    static async list(req: NextRequest): Promise<APIRet> {
        const searchParams = req.nextUrl.searchParams;

        const pageSize = Number(searchParams.get('size')) || 10;
        const pageNum = Number(searchParams.get('page')) || 1;

        const list = await DBService.getFiles({ pageSize, pageNum });
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    @CheckLogin
    static async upload(req: NextRequest): Promise<APIRet> {
        try {
            let cateId,
                tagIds,
                file,
                fileHash = '',
                fileName = '',
                filePath = '';
            try {
                const formData = await req.formData();
                if (!formData || !formData.has('file')) {
                    return ErrorRet('no parameter file upload');
                }

                cateId = formData.get('category');
                tagIds = formData.get('tags');

                file = formData.get('file') as File;
                fileHash = await getFileHash(file);
                fileName = `${fileHash}.${file.name.split('.')[1]}`;
                filePath = path.join(UPLOAD_PATH, fileName);
            } catch (error) {
                logError('error on get formData or getFileHash: ', error);
                return ErrorRet('error on parsing data');
            }

            // save file to fds
            await pipelineAsync(Readable.fromWeb(file.stream()), createWriteStream(filePath));
            const ret = await DBService.saveOrUpdateDocument({ fileHash, filePath, cateId, tagIds });
            if (ret) {
                return {
                    code: 0,
                    data: {
                        fileName,
                        originalFilename: file?.name,
                        mimetype: file.type,
                        size: file.size,
                    },
                    message: 'save ok',
                };
            }
        } catch (error: any) {
            logError('fileUpload service: ', error);
        }
        return ErrorRet('upload failed');
    }

    @LogAPIRoute
    @CheckLogin
    static async chat(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: {}, message: 'ok' };
    }

    @LogAPIRoute
    @CheckLogin
    static async delete(req: NextRequest): Promise<APIRet> {
        // const ret = await deleteEmbeddings('');
        return { code: 0, data: null, message: 'ok' };
    }
}
