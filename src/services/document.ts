import type { NextRequest } from 'next/server';

import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

import { getFileHash } from '@/utils/common';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo } from '@/utils/logger';

import DBService from './db';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

const ErrorRet = (msg: string) => {
    return { code: -1, data: false, message: msg } as APIRet;
};

export default class DocumentService {
    static isFileUploading: boolean = false;

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
            // TODO: 暂时简单限制并发
            if (this.isFileUploading) {
                return ErrorRet('file is already in processing');
            }

            this.isFileUploading = true;

            let cateId,
                tags,
                file,
                fileHash = '',
                fileName = '',
                filePath = '';

            const formData = await req.formData();
            if (!formData || !formData.has('file')) {
                return ErrorRet('no parameter file upload');
            }

            cateId = Number(formData.get('category'));
            tags = formData.get('tags');
            if (tags) {
                tags = JSON.parse(tags).map((tag: any) => {
                    if (typeof tag === 'object') {
                        return { id: Number(tag.id), name: tag.name, alias: tag.alias };
                    }
                    return { id: Number(tag), name: '', alias: '' };
                });
            }

            console.time('FileUploading Costs:');
            file = formData.get('file') as File;
            fileHash = await getFileHash(file);
            fileName = `${fileHash}.${file.name.split('.')[1]}`;
            filePath = path.join(UPLOAD_PATH, fileName);
            await pipelineAsync(Readable.fromWeb(file.stream()), createWriteStream(filePath));
            console.timeEnd('FileUploading Costs:');
            logInfo('file has been uploaded: ', filePath);

            const ret = await DBService.saveOrUpdateDocument({ fileHash, filePath, cateId, tags });
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
        } finally {
            this.isFileUploading = false;
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
