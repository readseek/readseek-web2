'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter } from 'langchain/text_splitter';

import { logError } from '@/utils/logger';

import { getOptimizedUnstructuredLoader } from './documentLoader';

export async function getSplitContents(filepath: string) {
    try {
        const loader = getOptimizedUnstructuredLoader(filepath);
        console.time('Document Loading');
        const docs: Document[] = await loader.load();
        console.timeEnd('Document Loading');

        const processedDocuments = docs.filter(doc => doc.pageContent.length > 0);

        return new TokenTextSplitter({
            chunkSize: 3000,
            chunkOverlap: 200,
        }).splitDocuments(processedDocuments);
    } catch (error) {
        logError('getSplitContents error', error);
    }
    return null;
}
