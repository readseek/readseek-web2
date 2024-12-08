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
import { logInfo } from '@/utils/logger';

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
            loader = getOptimizedUnstructuredLoader(fileType, filePath);
            break;
    }
    return loader;
}

export function getOptimizedUnstructuredLoader(fileType: DocumentType, filePath: string): DocumentLoader {
    const fileSize = statSync(filePath || '').size / (1024 * 1024);
    const strategies: Record<string, UnstructuredLoaderStrategy> = {
        md: 'fast',
        txt: 'fast',
        csv: 'fast',
        tsv: 'fast',
        doc: 'fast',
        docx: 'fast',
        html: 'fast',
        pdf: fileSize > 15 ? 'hi_res' : 'fast',
        epub: fileSize > 15 ? 'hi_res' : 'fast',
        jpg: 'ocr_only',
        png: 'ocr_only',
    };

    const loaderOptions: UnstructuredLoaderOptions = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
        encoding: 'utf8',

        // Performance and Extraction Strategy
        strategy: strategies[fileType] || 'auto',

        // Parsing Optimization
        chunkingStrategy: 'by_title', // Intelligent section-based chunking
        maxCharacters: 100000, // Limit chunk size
        combineUnderNChars: 1000, // Combine small chunks
        overlap: 200, // Slight overlap between chunks for context

        // File Type Specific Optimizations
        coordinates: false, // Disable positional data
        pdfInferTableStructure: true,

        // Advanced Parsing Controls
        xmlKeepTags: false, // Simplify XML parsing
        includePageBreaks: false, // Disable page break tracking
        multiPageSections: true, // Allow section spanning multiple pages

        // Advanced Chunking
        overlapAll: false, // Prevent excessive overlapping
        newAfterNChars: 3000, // Create new chunks after 3000 characters

        // Image Extraction (if needed)
        extractImageBlockTypes: ['image/jpeg', 'image/png'],

        // OCR and Language Configuration
        ocrLanguages: ['en', 'zh-Hans'], // Only required languages
    };
    return new UnstructuredLoader(filePath, loaderOptions);
}
