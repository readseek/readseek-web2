'use server';

import type { DocumentLoader } from 'langchain/document_loaders/base';

import { statSync } from 'node:fs';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { UnstructuredLoader, UnstructuredLoaderOptions, UnstructuredLoaderStrategy } from '@langchain/community/document_loaders/fs/unstructured';
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
    // const fileSize = statSync(filePath || '').size / (1024 * 1024);
    // const strategies: Record<string, UnstructuredLoaderStrategy> = {
    //     md: 'hi_res',
    //     txt: 'hi_res',
    //     csv: 'hi_res',
    //     tsv: 'hi_res',
    //     doc: 'hi_res',
    //     docx: 'hi_res',
    //     html: 'hi_res',
    //     jpg: 'ocr_only',
    //     png: 'ocr_only',
    //     pdf: fileSize > 50 ? 'fast' : 'hi_res',
    //     epub: fileSize > 50 ? 'fast' : 'hi_res',
    // };

    const loaderOptions: UnstructuredLoaderOptions = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,

        // Performance and Extraction Strategy
        // strategy: strategies[type] || 'auto',
        strategy: 'auto',

        // Chunking Elements
        // chunkingStrategy: 'basic', // https://docs.unstructured.io/api-reference/api-services/chunking#basic-chunking-strategy
        hiResModelName: 'yolox_quantized', // chipper | detectron2_onnx | yolox | yolox_quantized
        xmlKeepTags: false, // Simplify XML parsing
        includePageBreaks: true, // Disable page break tracking
        skipInferTableTypes: ['jpg', 'jpeg', 'png', 'xls', 'xlsx'],
        overlap: 200, // Slight overlap between chunks for context
        overlapAll: false, // Prevent excessive overlapping
        maxCharacters: 20000, // Limit chunk size
        newAfterNChars: 4000, // Create new chunks after 3000 characters
        multiPageSections: true, // Allow section spanning multiple pages
        combineUnderNChars: 200,

        // @ts-ignore
        languages: ['eng', 'chi_sim', 'chi_tra'], //languages is preferred. ocr_languages is marked for deprecation.
        ocrLanguages: ['eng', 'chi_sim', 'chi_tra'],
    };

    logInfo('🤖 loaderOptions:\n', type, loaderOptions);

    return new UnstructuredLoader(filePath, loaderOptions);
}
