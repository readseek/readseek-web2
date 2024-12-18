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
    const fileSize = statSync(filePath || '').size / (1024 * 1024);
    const strategies: Record<string, UnstructuredLoaderStrategy> = {
        md: 'fast',
        txt: 'fast',
        csv: 'fast',
        tsv: 'fast',
        doc: 'fast',
        docx: 'fast',
        html: 'fast',
        pdf: fileSize > 20 ? 'hi_res' : 'fast',
        epub: fileSize > 20 ? 'hi_res' : 'fast',
        jpg: 'ocr_only',
        png: 'ocr_only',
    };

    const loaderOptions: UnstructuredLoaderOptions = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
        encoding: 'utf8',

        // Performance and Extraction Strategy
        strategy: 'auto',
        // strategy: strategies[type] || 'auto',

        // Parsing Optimization
        //chunkingStrategy: 'by_similarity', // Intelligent section-based chunking
        overlap: 200, // Slight overlap between chunks for context
        overlapAll: false, // Prevent excessive overlapping
        newAfterNChars: 4000, // Create new chunks after 3000 characters
        combineUnderNChars: 500, // Combine small chunks
        maxCharacters: 20000, // Limit chunk size
        coordinates: false, // Disable positional data

        // // Advanced Parsing Controls
        xmlKeepTags: false, // Simplify XML parsing
        includePageBreaks: false, // Disable page break tracking
        multiPageSections: true, // Allow section spanning multiple pages
    };

    logInfo('🤖 loaderOptions:\n', loaderOptions);

    return new UnstructuredLoader(filePath, loaderOptions);
}
