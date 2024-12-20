import type { NextRequest } from 'next/server';

import { createWriteStream, existsSync, unlink } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

import { DocumentType } from '@/types';
import { getFileHash, getFileType } from '@/utils/common';
import { LogAPIRoute, CheckLogin } from '@/utils/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import DBService from './db';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

const ErrorRet = (msg: string) => {
    return { code: -1, data: false, message: msg } as APIRet;
};

export default class DocumentService {
    static isFileUploading: boolean = false;

    static async removeUploadedFile(fpath: string): Promise<void> {
        try {
            if (existsSync(fpath || '')) {
                promisify(unlink)(fpath);
                logInfo('uploaded file has been deleted');
                return;
            }
            logWarn('file delete failed, wrong file path or file not exists:', fpath);
        } catch (error) {
            logError('removeUploadedFile:', error);
        }
    }

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
        let cateId,
            tags,
            file,
            fileHash = '',
            fileName = '',
            filePath = '';
        try {
            // TODO: 暂时简单限制并发
            if (this.isFileUploading) {
                return ErrorRet('file is already in processing');
            }

            this.isFileUploading = true;

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

            file = formData.get('file') as File;
            fileHash = await getFileHash(file);
            fileName = `${fileHash}.${file.name.split('.')[1]}`;
            filePath = path.join(UPLOAD_PATH, fileName);

            if (!existsSync(filePath)) {
                console.time('📤 FileUploading Costs:');
                await pipelineAsync(Readable.fromWeb(file.stream()), createWriteStream(filePath));
                console.timeEnd('📤 FileUploading Costs:');
                logInfo('file has been uploaded: ', filePath);
            }

            logInfo('💪 file is ready, start parsing and embedding...');
            console.time('🔥 ParseAndSaveContent Costs:');
            const { state, message } = await DBService.saveOrUpdateDocument({ fileHash, filePath, cateId, tags, type: getFileType(path.parse(filePath).ext) });
            console.timeEnd('🔥 ParseAndSaveContent Costs:');
            return {
                code: state ? 0 : -1,
                message: message ?? 'upload success',
                data: {
                    fileHash,
                    fileName: file?.name,
                    fileSize: file.size,
                },
            };
        } catch (error: any) {
            logError('fileUpload service: ', error);
            this.removeUploadedFile(filePath);
            return ErrorRet(error || 'upload failed');
        } finally {
            this.isFileUploading = false;
        }
    }

    @LogAPIRoute
    @CheckLogin
    static async delete(req: NextRequest): Promise<APIRet> {
        const jsonData = await req.json();
        if (!jsonData || !jsonData?.id) {
            return ErrorRet('no file id found');
        }

        try {
            const { id, type } = jsonData;
            // 清理数据库
            const ret = await DBService.deleteFileStorage(id);
            if (ret) {
                // 清理已上传的文件
                this.removeUploadedFile(path.join(UPLOAD_PATH, `${id}.${DocumentType[type]}`) || '');
                return { code: 0, data: null, message: 'ok' };
            }
        } catch (error) {
            logError('fileDelete service: ', error);
        }
        return { code: -1, data: null, message: 'delete failed' };
    }

    @LogAPIRoute
    @CheckLogin
    static async chat(req: NextRequest): Promise<APIRet> {
        return { code: 0, data: {}, message: 'ok' };
    }
}
