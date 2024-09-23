import { DocumentType } from '@/types';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';
import type { DocumentLoader } from 'langchain/document_loaders/base';
import { TextLoader } from 'langchain/document_loaders/fs/text';

const UNSTRUCTURED_API_KEY = process.env.__RSN_UNSTRUCTURED_API_KEY as string;
const UNSTRUCTURED_API_URL = process.env.__RSN_UNSTRUCTURED_API_URL as string;

export const getDocumentLoader = (fileType: DocumentType, filePath: string): DocumentLoader => {
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
            loader = getUnstructuredLoader(filePath);
            break;
    }
    return loader;
};

export const getUnstructuredLoader = (filePath: string): DocumentLoader => {
    const loader = new UnstructuredLoader(filePath, {
        apiKey: UNSTRUCTURED_API_KEY,
        apiUrl: UNSTRUCTURED_API_URL,
        encoding: 'utf8',
        strategy: 'auto',
        ocrLanguages: ['en', 'zh-Hans'],
    });
    return loader;
};
