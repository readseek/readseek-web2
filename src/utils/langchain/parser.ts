'use server';

import type { Document } from 'langchain/document';

import { TokenTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { logError, logInfo } from '@/utils/logger';

import { writeToFile } from '../filewriter';

import { getDocumentLoader } from './file-loader';

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

export async function getSplitContents(filepath: string, extName: string) {
    console.time('📊 loadAndTokenTextSplit costs:');
    const docs: Document[] = await getDocumentLoader(filepath, extName).load();
    const splitDocs = new RecursiveCharacterTextSplitter({
        chunkSize: 3072,
        chunkOverlap: 200,
        separators: ['|', '##', '>', '-'],
    }).splitDocuments(docs);
    console.timeEnd('📊 loadAndTokenTextSplit costs:');
    return splitDocs;
}

export async function parseFileContent(filePath: string, extName: string): Promise<ParsedResult> {
    try {
        console.time('🕰 parseFileContent costs:');
        const segments = (await getSplitContents(filePath, extName)) as LSegment[];

        // test file pare
        // writeToFile(segments);

        if (Array.isArray(segments) && segments.length > 0) {
            // 标题和描述暂时均从第一节内容截取
            const firstParts = segments[0].pageContent.split('\n\n');
            logInfo('File firstPart:\n', firstParts);

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
    } catch (error) {
        logError('getSplitContents', error);
        throw error;
    } finally {
        console.timeEnd('🕰 parseFileContent costs:');
    }
}
