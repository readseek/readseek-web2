import { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { systemLog } from '../common';

export function getSplitterDocument(docs: Document[]): Promise<Document[]> | null {
    try {
        return new TokenTextSplitter({
            chunkSize: 2048,
            chunkOverlap: 200,
        }).splitDocuments(docs);
    } catch (error) {
        systemLog(1, 'getSplitterDocument error', error);
        return null;
    }
}
