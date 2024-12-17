'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter } from 'langchain/text_splitter';

import { logError } from '@/utils/logger';

import { getOptimizedUnstructuredLoader } from './documentLoader';

export async function getSplitContents(filepath: string, fileType: string) {
    try {
        console.time('🏆 Document Loading&splitting:');
        const docs: Document[] = await getOptimizedUnstructuredLoader(filepath, fileType).load();
        const processedDocuments = docs.filter(doc => doc.pageContent.trim().length > 0);

        return new TokenTextSplitter({
            chunkSize: 4000, // 4k
            chunkOverlap: 200,
        }).splitDocuments(processedDocuments);
    } catch (error) {
        logError('getSplitContents', error);
    } finally {
        console.timeEnd('🏆 Document Loading&splitting:');
    }
    return null;
}
