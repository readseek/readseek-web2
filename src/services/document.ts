import { getFileType, systemLog } from '@/utils/common';
import { deleteEmbeddings, saveEmbeddings } from '@/utils/embeddings';
import { getUnstructuredLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import formidable from 'formidable';
import type { Document } from 'langchain/document';
import type { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'util';

const UPLOAD_PATH = process.env.__RSN_UPLOAD_PATH!;
const form = formidable({
    multiples: false,
    uploadDir: UPLOAD_PATH,
    keepExtensions: true,
    allowEmptyFiles: false,
    maxFiles: 5,
    maxFileSize: 200 * 1024 * 1024,
    hashAlgorithm: 'sha256',
    createDirsFromUploads: true,
});
const parseForm = promisify(form.parse);

async function parseAndSaveContentEmbedding(faPath: string): Promise<boolean> {
    try {
        const { name, ext } = path.parse(faPath);
        const fileType = getFileType(ext);

        const loader = getUnstructuredLoader(faPath);
        const documents: Document[] = await loader.load();
        const splitDocuments = await getSplitterDocument(documents);

        if (Array.isArray(splitDocuments) && splitDocuments.length > 0) {
            const content = {
                metadata: {
                    fileName: name,
                    fileType: fileType,
                    title: splitDocuments[0].pageContent || splitDocuments[0].metadata.filename,
                },
                sentences: splitDocuments.map(doc => doc.pageContent),
            };
            return await saveEmbeddings(content);
        }
    } catch (error) {
        systemLog(-1, 'parseAndSaveContentEmbedding error: ', error);
    }
    return false;
}

async function getFileHash(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256'); // 64
        const stream = fs.createReadStream(path);

        stream.on('data', data => {
            hash.update(data);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', err => {
            systemLog(-1, err);
            reject(err);
        });
    });
}

/**
 * File upload entry
 * @param req NextRequest
 * @returns APIRet
 */
export async function fileUpload(req: NextRequest): Promise<APIRet> {
    try {
        // @ts-ignore
        const results: any = await parseForm(req);
        systemLog(0, results);
        if (!results || !results?.files?.file) {
            return { code: -1, data: false, message: 'no file upload' };
        }

        const uploadedFile = results?.files?.file as formidable.File;

        const ret = await parseAndSaveContentEmbedding(uploadedFile.filepath);
        if (ret) {
            return { code: 0, data: uploadedFile, message: 'upload and save success' };
        }
    } catch (error) {
        systemLog(-1, 'fileUpload error: ', error);
    }
    return { code: -1, data: false, message: 'fileUpload error' };
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
