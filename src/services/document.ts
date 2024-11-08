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
    static async list(req: NextRequest): Promise<APIRet> {
        const list = await DBService.getFiles(null);
        if (list) {
            return { code: 0, data: list, message: 'success' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    @CheckLogin
    static async upload(req: NextRequest): Promise<APIRet> {
        try {
            const contentType = req.headers.get('content-type') || '';
            if (!contentType.includes('multipart/form-data')) {
                return ErrorRet('Invalid content type');
            }

            let file,
                fileHash = '',
                fileName = '',
                filePath = '';
            try {
                const formData = await req.formData();
                if (!formData || !formData.has('file')) {
                    return ErrorRet('no parameter file upload');
                }
                file = formData.get('file') as File;
                fileHash = await getFileHash(file);
                fileName = `${fileHash}.${file.name.split('.')[1]}`;
                filePath = path.join(UPLOAD_PATH, fileName);
            } catch (error) {
                logError('error on get formData or getFileHash: ', error);
                return ErrorRet('error on parsing uploaded data');
            }

            // save file to fds
            await pipelineAsync(Readable.fromWeb(file.stream()), createWriteStream(filePath));
            const ret = await DBService.saveOrUpdateDocument({ fileHash, filePath });
            if (ret) {
                return {
                    code: 0,
                    data: {
                        fileName,
                        originalFilename: file?.name,
                        mimetype: file.type,
                        size: file.size,
                    },
                    message: 'upload and save success',
                };
            }
        } catch (error: any) {
            logError('fileUpload service: ', error);
        }
        return ErrorRet('fileUpload failed');
    }

    @LogAPIRoute
    @CheckLogin
    static async chat(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: {}, message: 'success' };
    }

    @LogAPIRoute
    @CheckLogin
    static async delete(req: NextRequest): Promise<APIRet> {
        // const ret = await deleteEmbeddings('');
        return { code: 0, data: null, message: 'success' };
    }
}
