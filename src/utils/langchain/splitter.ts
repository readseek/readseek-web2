'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter } from 'langchain/text_splitter';
import { Agent } from 'undici';

import { logError } from '@/utils/logger';

import { getOptimizedUnstructuredLoader } from './documentLoader';

// UND_ERR_HEADERS_TIMEOUT: https://github.com/langchain-ai/langchainjs/issues/1856
globalThis[Symbol.for('undici.globalDispatcher.1')] = new Agent({
    allowH2: true,
    headersTimeout: 1000 * 60 * 60 * 2, // 2h
    bodyTimeout: 0,
});

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
