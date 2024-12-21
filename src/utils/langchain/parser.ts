'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter } from 'langchain/text_splitter';
import { Agent } from 'undici';

import { logError } from '@/utils/logger';

import { getOptimizedUnstructuredLoader } from './file-loader';

// UND_ERR_HEADERS_TIMEOUT: https://github.com/langchain-ai/langchainjs/issues/1856
globalThis[Symbol.for('undici.globalDispatcher.1')] = new Agent({
    allowH2: true,
    headersTimeout: 1000 * 60 * 60 * 2, // 2h
    bodyTimeout: 0,
});

// Langchain Document real types, for per text segment
export type LSegment = {
    metadata: {
        category: string;
        filename: string;
        filetype: string;
        languages: string[];
        loc: object;
        orig_elements: string;
        emphasized_text_contents?: string[];
        emphasized_text_tags?: string[];
    };
    pageContent: string;
};

export type DocumentMeta = {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: string[]; //original authors
    coverUrl?: string;
    content?: object;
};

export type ParsedResult = {
    state: boolean;
    meta?: DocumentMeta;
    segments?: LSegment[];
};

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

export async function parseFileContent(filePath: string, type: string): Promise<ParsedResult> {
    try {
        const segments = (await getSplitContents(filePath, type)) as LSegment[];
        if (Array.isArray(segments) && segments.length > 0) {
            // 从第一段内容截取
            const title = segments[0].pageContent
                .trim()
                .replace(/(\n+|#|\*|%|@|\$|&|-{2,})/g, '')
                .substring(0, 128);
            // 从前三段内容截取
            const description = segments
                .slice(0, 3)
                .map(item => item.pageContent)
                .join(',')
                .replace(/(\n+|#|\*|%|@|\$|&|-{2,})/g, '')
                .substring(0, 255);

            // 返回实际的内容数据落库
            return {
                state: true,
                meta: {
                    title,
                    description,
                    keywords: title.split('.'),
                    authors: ['tomartisan'], // 先写死，后面从前端传过来
                    coverUrl: process.env.__RSN_DEFAULT_COVER, // 后边从网络抓取，或随机
                },
                segments,
            };
        }
    } catch (error) {
        logError('parseFileContent', error);
    }
    return { state: false };
}
