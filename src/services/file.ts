import type { SearchResults, QueryResults } from '@zilliz/milvus2-sdk-node';
import type { NextRequest } from 'next/server';

import { createWriteStream, existsSync, mkdir, unlink } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

import { Message, MessageAttitude, packingMessage } from '@/models/Conversation';
import { DocumentType, Document } from '@/models/Document';
import ConversationService from '@/services/conversation';
import { getFileHash } from '@/utils/common';
import { deleteFileStorage, getCategories, getDocumentInfo, getFiles, getTags, chatQuery, saveOrUpdateDocument, chatSearch } from '@/utils/database';
import { LogAPIRoute, CheckLogin } from '@/utils/http/decorators';
import { logError, logInfo, logWarn } from '@/utils/logger';

import BaseService from './_base';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

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

    async removeUploadedFile(fpath: string): Promise<void> {
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
    async delete(req: NextRequest): Promise<APIRet> {
        const jsonData = await req.json();
        if (!jsonData || !jsonData?.id) {
            return this.renderError('no file id found');
        }

        try {
            const { id, type } = jsonData;
            // 清理数据库
            const ret = await deleteFileStorage(id);
            if (ret) {
                // 清理已上传的文件
                this.removeUploadedFile(path.join(UPLOAD_PATH, `${id}.${DocumentType[type]}`) || '');
                return { code: 0, data: null, message: 'ok' };
            }
        } catch (error) {
            logError('fileDelete: ', error);
        }
        return { code: -1, data: null, message: 'delete failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async initChat(req: NextRequest): Promise<APIRet> {
        try {
            const docId = req.nextUrl.searchParams.get('id') as string;
            if (!docId || docId.trim().length !== 64) {
                return this.renderError('id is missing or incorrect');
            }

            const doc = (await getDocumentInfo(docId)) as Document;
            return { code: 0, data: doc, message: 'ok' };
        } catch (error) {
            logError('initChat: ', error);
        }
        return { code: -1, data: null, message: 'chat start failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async fileSearch(req: NextRequest): Promise<APIRet> {
        const { input, id } = await req.json();
        const messageBuff: Message[] = [];
        try {
            if (input && id) {
                messageBuff.push(packingMessage({ role: 'user', content: input }));
                const rets: SearchResults = await chatSearch(input, id);
                if (rets.status.code === 0) {
                    logInfo(
                        `Matched #${input}# scores: `,
                        rets.results.map(r => r.score),
                    );
                    const relatedTexts = rets.results.filter(r => r.score > 0.35).map(r => r.text);
                    const msgOut = packingMessage({
                        role: 'bot',
                        content: relatedTexts.length > 0 ? relatedTexts[0] : '抱歉，暂未匹配到相关内容',
                        ma: MessageAttitude.default,
                        rags: relatedTexts.length > 0 ? relatedTexts.splice(1) : null,
                    });

                    messageBuff.push(msgOut);

                    return {
                        code: 0,
                        data: msgOut,
                        message: 'ok',
                    };
                }
                logWarn('chatSearch failed: \n', rets.status);
                return { code: -1, data: null, message: rets.status.reason };
            }
        } catch (error) {
            logError('fileSearch service: ', error);
        } finally {
            ConversationService.syncMessage(id, messageBuff);
        }
        return { code: -1, data: null, message: 'fileSearch failed' };
    }

    @LogAPIRoute
    @CheckLogin
    async fileQuery(req: NextRequest): Promise<APIRet> {
        try {
            const { input, id } = await req.json();
            if (input && id) {
                const rets: QueryResults = await chatQuery(input, id);
                return { code: 0, data: rets, message: 'ok' };
            }
        } catch (error) {
            logError('fileQuery service: ', error);
        }
        return { code: -1, data: null, message: 'fileQuery failed' };
    }
}

const service: FileService = new FileService();

export default service;
