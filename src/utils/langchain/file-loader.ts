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

import { DocumentType } from '@/models/Document';

import { logInfo } from '../logger';

const UNSTRUCTURED_API_KEY = process.env.__RSN_UNSTRUCTURED_API_KEY as string;
const UNSTRUCTURED_API_URL = process.env.__RSN_UNSTRUCTURED_API_URL as string;

/**
 * 超过20MB的文件，统一用fast策略，以加快解析效率
 */
const strategyWithFile = (fPath: string, fExt?: string): UnstructuredLoaderStrategy => {
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

export function getDocumentLoader(filePath: string, fileType: DocumentType): DocumentLoader {
    let loader;
    switch (fileType) {
        case DocumentType.PDF:
            loader = new PDFLoader(filePath, {
                splitPages: false,
                parsedItemSeparator: '',
            });
            break;
        case DocumentType.EPUB:
            loader = new EPubLoader(filePath, {
                splitChapters: false,
            });
            break;
        case DocumentType.DOC:
        case DocumentType.DOCX:
            loader = new DocxLoader(filePath);
            break;
        case DocumentType.CSV:
            loader = new CSVLoader(filePath);
            break;
        case DocumentType.TSV:
            loader = new CSVLoader(filePath, {
                separator: '\t',
            });
            break;
        case DocumentType.TXT:
            loader = new TextLoader(filePath);
            break;
        default:
            // for markdown and html
            loader = getOptimizedUnstructuredLoader(filePath, fileType);
            break;
    }
    return loader;
}

/**
 * https://docs.unstructured.io/api-reference/api-services/api-parameters
 * @param filePath file absolute path
 * @param ext file ext type
 * @returns {DocumentLoader}
 */
export function getOptimizedUnstructuredLoader(filePath: string, ext?: string): DocumentLoader {
    const strategy = strategyWithFile(filePath, ext);
    logInfo('🤖 loader strategy is: ', strategy);

    return new UnstructuredLoader(filePath, {
        strategy,
        hiResModelName: 'yolox_quantized', // chipper | detectron2_onnx | yolox | yolox_quantized
        chunkingStrategy: 'by_title', // for self-hosting api, only by_title supported or null
        combineUnderNChars: 512,
        newAfterNChars: 4096,
        maxCharacters: 8192,
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
