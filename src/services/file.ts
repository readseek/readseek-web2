import type { NextRequest } from 'next/server';

import { createWriteStream, existsSync, mkdir } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

import { UPLOAD_PATH } from '@/constants/application';
import { getFileHash } from '@/utils/common';
import { getCategories, getFiles, getTags, saveOrUpdateDocument } from '@/utils/database';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logInfo } from '@/utils/logger';

import BaseService from './_base';

const pipelineAsync = promisify(pipeline);

class FileService extends BaseService {
    constructor() {
        super();
        // Ensure the upload directory exists
        this.ensureUploadDirectory();
    }

    private async ensureUploadDirectory() {
        try {
            if (!existsSync(UPLOAD_PATH)) {
                await promisify(mkdir)(UPLOAD_PATH, { recursive: true });
                logInfo('Upload directory created:', UPLOAD_PATH);
            }
        } catch (error) {
            logError('Failed to create upload directory:', error);
        }
    }

    @LogAPIRoute
    async categoryList(req: NextRequest): Promise<APIRet> {
        const list = await getCategories();
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    async tagList(req: NextRequest): Promise<APIRet> {
        const list = await getTags();
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    async list(req: NextRequest): Promise<APIRet> {
        const searchParams = req.nextUrl.searchParams;

        const pageSize = Number(searchParams.get('size')) || 10;
        const pageNum = Number(searchParams.get('page')) || 1;

        const list = await getFiles({ pageSize, pageNum });
        if (list) {
            return { code: 0, data: list, message: 'ok' };
        }
        return { code: 0, data: [], message: 'no data found' };
    }

    @LogAPIRoute
    @CheckLogin
    async upload(req: NextRequest): Promise<APIRet> {
        // Log the upload path and environment variable
        logInfo('Upload environment variable:', process.env.__RSN_UPLOAD_PATH);
        logInfo('Upload path:', UPLOAD_PATH);
        try {
            let file,
                fileHash = '',
                fileName = '',
                filePath = '',
                cateId: number,
                tags = [];

            const formData = await req.formData();
            if (!formData || !formData.has('file')) {
                return this.renderError('no parameter file upload');
            }

            cateId = Number(formData.get('category'));
            if (formData.has('tags')) {
                tags = JSON.parse(formData.get('tags') as string).map((tag: any) => {
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
            const { state, message } = await saveOrUpdateDocument({ fileHash, filePath, cateId, tags });
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
            logError('fileUpload: ', error);
            return this.renderError(error || 'upload failed');
        }
    }

    @LogAPIRoute
    @CheckLogin
    async query(req: NextRequest): Promise<APIRet> {
        try {
            const { input, id } = await req.json();
            logInfo('Querying files...');
            if (input && id) {
                return { code: 0, data: [], message: 'ok' };
            }
        } catch (error) {
            logError('fileQuery service: ', error);
        }
        return { code: -1, data: null, message: 'fileQuery failed' };
    }
}

const service: FileService = new FileService();

export default service;
