'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter } from 'langchain/text_splitter';
import { Agent } from 'undici';

import { logError, logInfo } from '@/utils/logger';

import { getOptimizedUnstructuredLoader } from './file-loader';

/**
 * 以下hack解决：
 * 1、UND_ERR_HEADERS_TIMEOUT: https://github.com/langchain-ai/langchainjs/issues/1856
 * 2、对于较大文件，仍然有响应超时的问题（TODO:）
 code: 'UND_ERR_SOCKET',
    socket: {
      localAddress: '127.0.0.1',
      localPort: 64589,
      remoteAddress: '127.0.0.1',
      remotePort: 8000,
      remoteFamily: 'IPv4',
      timeout: undefined,
      bytesWritten: 58178047,
      bytesRead: 0
} 
 */
const __timeout = 1000 * 60 * 60 * 12; // 12h
globalThis[Symbol.for('undici.globalDispatcher.1')] = new Agent({
    allowH2: true,
    headersTimeout: __timeout,
    bodyTimeout: 0,
    keepAliveMaxTimeout: __timeout,
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

export async function getSplitContents(filepath: string) {
    try {
        console.time('🏆 Document Loading&splitting:');
        const docs: Document[] = await getOptimizedUnstructuredLoader(filepath).load();
        logInfo('Doc length from UnstructuredLoader: ', docs.length);

        return new TokenTextSplitter({
            chunkSize: 4096, // 4k
            chunkOverlap: 200,
        }).splitDocuments(docs);
    } catch (error) {
        logError('getSplitContents', error);
        throw error;
    } finally {
        console.timeEnd('🏆 Document Loading&splitting:');
    }
}

export async function parseFileContent(filePath: string): Promise<ParsedResult> {
    const segments = (await getSplitContents(filePath)) as LSegment[];
    if (Array.isArray(segments) && segments.length > 0) {
        // 标题和描述暂时均从第一节内容截取
        const firstParts = segments[0].pageContent.split('\n\n');
        let title = '',
            description = '',
            keywords = [''];
        if (firstParts.length > 0) {
            title = firstParts[0].replace(/(#|\*|%|@|\$|&|-{2,})/g, '').substring(0, 128);
            description = firstParts
                .join('')
                .replace(/(#|\*|%|@|\$|&|-{2,})/g, '')
                .substring(0, 255);
            // 暂时直接切割标题
            keywords = title.split(' ');
        }
        // 返回实际的内容数据落库，以便前后台给用户展示
        return {
            state: true,
            meta: {
                title,
                description,
                keywords,
                authors: ['tomartisan'], // 先写死，后面从前端传过来。或者从网络抓取
                coverUrl: process.env.__RSN_DEFAULT_COVER, // 后边从网络抓取，或随机
            },
            segments,
        };
    }
    return { state: false };
}
