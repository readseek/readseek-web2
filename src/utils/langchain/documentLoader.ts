import type { DocumentLoader } from 'langchain/document_loaders/base';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';

export const getDocumentLoader = (fileType: string, filePath: string): DocumentLoader => {
    let loader;
    switch (fileType) {
        case 'pdf':
            loader = new PDFLoader(filePath, {
                splitPages: false,
            });
            return loader;
        case 'epub':
            loader = new EPubLoader(filePath, {
                splitChapters: false,
            });
            return loader;
        case 'docx':
            loader = new DocxLoader(filePath);
            return loader;
        case 'csv':
            loader = new CSVLoader(filePath);
            return loader;
        case 'tsv':
            loader = new CSVLoader(filePath, {
                separator: '\t',
            });
            return loader;
        case 'txt':
        case 'md':
        case 'html':
            loader = new TextLoader(filePath);
            return loader;
        default:
            loader = new UnstructuredLoader(filePath);
            return loader;
    }
};
