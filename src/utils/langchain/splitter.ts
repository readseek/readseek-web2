import type { Document } from 'langchain/document';
import { TokenTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DocumentType } from '@/types';

export const getSplitterDocument = (type: DocumentType, documents: any): Promise<Document[]> | null => {
    try {
        switch (type) {
            case DocumentType.Markdown:
                return RecursiveCharacterTextSplitter.fromLanguage('markdown', {
                    chunkSize: 256,
                    chunkOverlap: 64,
                }).createDocuments(documents);
            case DocumentType.HTML:
                return RecursiveCharacterTextSplitter.fromLanguage('html', {
                    chunkSize: 256,
                    chunkOverlap: 64,
                }).createDocuments(documents);
            default:
                return new TokenTextSplitter({
                    chunkSize: 2048,
                    chunkOverlap: 128,
                }).splitDocuments(documents);
        }
    } catch (error) {
        console.warn('getSplitterDocument error', error);
        return null;
    }
};
