import { getFileType, systemLog } from '@/utils/common';
import { deleteEmbeddings, saveEmbeddings } from '@/utils/embeddings';
import { getUnstructuredLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import type { Document } from 'langchain/document';
import type { NextRequest } from 'next/server';
import crypto, { randomUUID } from 'node:crypto';
import fs, { createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline, Readable } from 'node:stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);
const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH!);

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
        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return { code: -1, data: false, message: 'Invalid content type' };
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return { code: -1, data: false, message: 'no file upload' };
        }

        const fileName = `${randomUUID()}-${file.name}`;
        const filePath = path.join(UPLOAD_PATH, fileName);

        // @ts-ignore
        const fileStream = Readable.fromWeb(file.stream());
        const writeStream = createWriteStream(filePath);
        await pipelineAsync(fileStream, writeStream);

        // const ret = await parseAndSaveContentEmbedding(filePath);
        // if (ret) {
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
        // }
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
