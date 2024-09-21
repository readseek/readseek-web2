import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';

export const getSplitterDocument = (docs: Document[]): Promise<Document[]> | null => {
    try {
        return new TokenTextSplitter({
            chunkSize: 512,
            chunkOverlap: 100,
        }).splitDocuments(docs);
    } catch (error) {
        console.warn('getSplitterDocument error', error);
        return null;
    }
};
