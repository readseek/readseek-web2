import type { Document } from 'langchain/document';
import { TokenTextSplitter } from 'langchain/text_splitter';

export const getSplitterDocument = (fileType: string, documents: Document[]): Promise<Document[]> => {
    const splitter = new TokenTextSplitter({
        chunkSize: 3000,
        chunkOverlap: 200,
    });
    return splitter.splitDocuments(documents);
};
