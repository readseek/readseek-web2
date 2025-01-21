'use server';

import type { DocumentLoader } from 'langchain/document_loaders/base';

import { statSync } from 'node:fs';
import path from 'node:path';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { UnstructuredLoader, UnstructuredLoaderStrategy } from '@langchain/community/document_loaders/fs/unstructured';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Agent } from 'undici';

import { DocumentType } from '@/models/Document';

import { logInfo } from '../logger';

/**
 * 以下hack解决：
 * 1、UND_ERR_HEADERS_TIMEOUT: https://github.com/langchain-ai/langchainjs/issues/1856
 * 2、对于较大文件，仍然有响应超时的问题（TODO:）
 code: 'UND_ERR_SOCKET',
    socket: {
      localAddress: '127.0.0.1',
      localPort: 64589,
      remoteAddress: '127.0.0.1',
      remotePort: 8000,
      remoteFamily: 'IPv4',
      timeout: undefined,
      bytesWritten: 58178047,
      bytesRead: 0
} 
 */
const __timeout = 1000 * 60 * 60 * 12; // 12h
globalThis[Symbol.for('undici.globalDispatcher.1')] = new Agent({
    allowH2: true,
    headersTimeout: __timeout,
    bodyTimeout: 0,
    keepAliveMaxTimeout: __timeout,
});

const UNSTRUCTURED_API_KEY = process.env.__RSN_UNSTRUCTURED_API_KEY as string;
const UNSTRUCTURED_API_URL = process.env.__RSN_UNSTRUCTURED_API_URL as string;

/**
 * 超过20MB的文件，统一用fast策略，以加快解析效率
 */
const strategyWithFile = (fPath: string, fExt: string): UnstructuredLoaderStrategy => {
    try {
        const ext = fExt ?? path.parse(fPath).ext;
        const fileSize = statSync(fPath || '').size / (1024 * 1024);
        if (ext === 'jpeg' || ext === 'jpg' || ext === 'png') {
            return 'ocr_only';
        }
        if (fileSize > 20) {
            return 'fast';
        }
        return 'hi_res';
    } catch (error) {
        return 'auto';
    }
};

/**
 * https://docs.unstructured.io/api-reference/api-services/api-parameters
 * @param filePath file absolute path
 * @param extName file ext name(md|pdf|doc)
 * @returns {DocumentLoader}
 */
export function getOptimizedUnstructuredLoader(filePath: string, extName: string): DocumentLoader {
    const strategy = strategyWithFile(filePath, extName);
    logInfo('🤖 loader strategy is: ', strategy);

    return new UnstructuredLoader(filePath, {
        strategy,
        hiResModelName: 'yolox_quantized', // chipper | detectron2_onnx | yolox | yolox_quantized
        chunkingStrategy: 'by_title', // for self-hosting api, only by_title supported or null
        combineUnderNChars: 256,
        newAfterNChars: 3072, // 3k
        overlap: 0,
        overlapAll: false,
        coordinates: false,
        xmlKeepTags: false, // Simplify XML parsing
        includePageBreaks: true, // Disable page break tracking
        multiPageSections: true, // Allow section spanning multiple pages
        skipInferTableTypes: ['jpg', 'jpeg', 'png', 'xls', 'xlsx', 'pdf'],
        ocrLanguages: ['eng', 'chi_sim', 'chi_tra'], //languages is preferred. ocr_languages is marked for deprecation.

        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
    });
}

export function getDocumentLoader(filePath: string, extName: string): DocumentLoader {
    let loader;
    switch (extName) {
        case DocumentType.TXT:
            loader = new TextLoader(filePath);
            break;
        case DocumentType.PDF:
            loader = new PDFLoader(filePath, {
                splitPages: true, // setting false:  one document per file
                parsedItemSeparator: '', // eliminating extra spaces
            });
            break;
        case DocumentType.EPUB:
            loader = new EPubLoader(filePath, {
                splitChapters: true, // setting false: one document per file
            });
            break;
        case DocumentType.DOC:
        case DocumentType.DOCX:
            loader = new DocxLoader(filePath, {
                type: extName,
            });
            break;
        case DocumentType.CSV:
        case DocumentType.TSV:
            loader = new CSVLoader(filePath, {
                separator: extName === 'tsv' ? '\t' : ',',
            });
            break;
        default:
            // for markdown and html
            loader = getOptimizedUnstructuredLoader(filePath, extName);
            break;
    }
    return loader;
}
