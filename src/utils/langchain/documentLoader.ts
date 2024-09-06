import type { DocumentLoader } from 'langchain/document_loaders/base';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';
import { DocumentType } from '@/types';

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
            loader = new UnstructuredLoader(filePath, {
                encoding: 'utf8',
                strategy: 'auto',
                xmlKeepTags: false,
                includePageBreaks: false,
                ocrLanguages: ['en', 'zh-Hans'],
                skipInferTableTypes: ['pdf', 'epub', 'docx', 'pptx'],
            });
            break;
    }
    return loader;
};
