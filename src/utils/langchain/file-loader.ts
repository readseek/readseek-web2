'use server';

import type { DocumentLoader } from 'langchain/document_loaders/base';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { UnstructuredLoader, UnstructuredLoaderOptions } from '@langchain/community/document_loaders/fs/unstructured';
import { TextLoader } from 'langchain/document_loaders/fs/text';

import { DocumentType } from '@/types';

import { logInfo } from '../logger';

const UNSTRUCTURED_API_KEY = process.env.__RSN_UNSTRUCTURED_API_KEY as string;
const UNSTRUCTURED_API_URL = process.env.__RSN_UNSTRUCTURED_API_URL as string;

export function getDocumentLoader(fileType: DocumentType, filePath: string): DocumentLoader {
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

export function getOptimizedUnstructuredLoader(filePath: string, type: string): DocumentLoader {
    // https://docs.unstructured.io/api-reference/api-services/api-parameters
    const loaderOptions: UnstructuredLoaderOptions = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,

        strategy: 'auto',
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
    };

    logInfo('🤖 loaderOptions:\n', type, loaderOptions);

    return new UnstructuredLoader(filePath, loaderOptions);
}
