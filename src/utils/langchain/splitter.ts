import { DocumentType } from '@/types';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from 'langchain/text_splitter';

export const getSplitterDocument = (type: DocumentType, texts: string[]): Promise<Document[]> | null => {
    try {
        switch (type) {
            case DocumentType.TXT:
            case DocumentType.PDF:
            case DocumentType.EPUB:
            case DocumentType.DOC:
            case DocumentType.DOCX:
            case DocumentType.CSV:
            case DocumentType.TSV:
                return new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 64,
                }).createDocuments(texts);
            case DocumentType.Markdown:
                return RecursiveCharacterTextSplitter.fromLanguage('markdown', {
                    chunkSize: 1024,
                    chunkOverlap: 64,
                }).createDocuments(texts);
            case DocumentType.HTML:
                return RecursiveCharacterTextSplitter.fromLanguage('html', {
                    chunkSize: 1024,
                    chunkOverlap: 64,
                }).createDocuments(texts);
            default:
                const docs = texts.map(text => new Document({ pageContent: text }));
                return new TokenTextSplitter({
                    chunkSize: 2048,
                    chunkOverlap: 128,
                }).splitDocuments(docs);
        }
    } catch (error) {
        console.warn('getSplitterDocument error', error);
        return null;
    }
};
