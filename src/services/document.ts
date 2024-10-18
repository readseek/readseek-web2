import { getFileHash, systemLog } from '@/utils/common';
import LevelDB from '@/utils/database/leveldb';
import { deleteEmbeddings, parseAndSaveContentEmbedding } from '@/utils/embeddings';
import type { NextRequest } from 'next/server';
import fs, { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

/**
 * File upload entry
 * @param req NextRequest
 * @returns APIRet
 */
export async function fileUpload(req: NextRequest): Promise<APIRet> {
    try {
        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return { code: -1, data: false, message: 'Invalid content type' };
        }

        let file: File;
        const formData = await req.formData();
        if (!formData || !formData.has('file')) {
            return { code: -1, data: false, message: 'no parameter file upload' };
        }

        file = formData.get('file') as File;
        // @ts-ignore
        const fileStream = Readable.fromWeb(file.stream(), { encoding: 'utf-8' });
        const fileHash = await getFileHash(fileStream);
        const fileName = `${fileHash}.${file.name.split('.')[1]}`;
        const filePath = path.join(UPLOAD_PATH, fileName);

        // avoid duplicate uploads
        if (fs.existsSync(filePath)) {
            return {
                code: 1,
                data: {
                    fileName,
                    originalFilename: file.name,
                    mimetype: file.type,
                    size: file.size,
                },
                message: 'file already uploaded',
            };
        }

        const writeStream = createWriteStream(filePath);
        await pipelineAsync(fileStream, writeStream);

        // save local mappings
        await LevelDB.getSharedDB.put(fileHash, filePath);
        // save content embeddings
        const ret = await parseAndSaveContentEmbedding(filePath);
        // save supsbase postgresql

        if (ret) {
            console.log(ret);
        }

        return {
            code: 0,
            data: {
                filepath: filePath,
                originalFilename: file.name,
                mimetype: file.type,
                size: file.size,
            },
            message: 'upload and save success',
        };
    } catch (error: any) {
        systemLog(-1, 'fileUpload service: ', error);
        return { code: -1, data: false, message: error?.message || 'fileUpload error' };
    }
}

/**
 * File Embedding delete
 * @param req NextRequest
 * @returns APIRet
 */
export async function fileDelete(req: NextRequest): Promise<APIRet> {
    const ret = await deleteEmbeddings('');
    return { code: 0, data: ret, message: 'success' };
}

/**
 * Uploaded files for a login user
 * @param req NextRequest
 * @returns APIRet
 */
export async function fileList(req: NextRequest): Promise<APIRet> {
    return { code: 0, data: [], message: 'success' };
}

/**
 * Query file with keywords
 * @param req NextRequest
 * @returns APIRet
 */
export async function fileQuery(req: NextRequest): Promise<APIRet> {
    return { code: 0, data: {}, message: 'success' };
}
