'use server';

import type { DocumentLoader } from 'langchain/document_loaders/base';

import fs from 'node:fs';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { UnstructuredLoader, UnstructuredLoaderOptions } from '@langchain/community/document_loaders/fs/unstructured';
import { TextLoader } from 'langchain/document_loaders/fs/text';

import { DocumentType } from '@/types';

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
            loader = getOptimizedUnstructuredLoader(filePath);
            break;
    }
    return loader;
}

export function getOptimizedUnstructuredLoader(filePath: string): DocumentLoader {
    // Adaptive strategy based on file size
    const determineStrategy = (path: string): UnstructuredLoaderOptions => {
        const fileStats = fs.statSync(path);
        const fileSizeInMB = fileStats.size / (1024 * 1024);

        if (fileSizeInMB < 1) return { strategy: 'fast' }; // Small files
        if (fileSizeInMB < 10) return { strategy: 'hi_res' }; // Medium files
        return { strategy: 'ocr_only' }; // Large files
    };

    const loaderOptions: UnstructuredLoaderOptions = {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
        encoding: 'utf8',

        // Performance and Extraction Strategy
        strategy: determineStrategy(filePath).strategy,

        // Parsing Optimization
        chunkingStrategy: 'by_title', // Intelligent section-based chunking
        maxCharacters: 100000, // Limit chunk size
        combineUnderNChars: 1000, // Combine small chunks
        overlap: 200, // Slight overlap between chunks for context

        // OCR and Language Configuration
        coordinates: false, // Disable positional data
        ocrLanguages: ['en', 'zh-Hans'], // Only required languages

        // File Type Specific Optimizations
        hiResModelName: 'chipper',
        pdfInferTableStructure: true,
        skipInferTableTypes: ['docx', 'doc', 'xlsx', 'xls', 'jpg', 'jpeg', 'html', 'htm'],

        // Advanced Parsing Controls
        xmlKeepTags: false, // Simplify XML parsing
        includePageBreaks: false, // Disable page break tracking
        multiPageSections: true, // Allow section spanning multiple pages

        // Advanced Chunking
        overlapAll: false, // Prevent excessive overlapping
        newAfterNChars: 3000, // Create new chunks after 3000 characters

        // Image Extraction (if needed)
        extractImageBlockTypes: ['image/jpeg', 'image/png'],
    };

    const loader = new UnstructuredLoader(filePath, loaderOptions);
    return loader;
}
