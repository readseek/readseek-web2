'use server';

import type { Document } from 'langchain/document';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { DocumentLang } from '@/models/Document';
import { logError, logInfo } from '@/utils/logger';

import { getDocumentLoader } from './loader';

export type DocumentMeta = {
    title: string;
    description: string;
    keywords: string[];
    lang: DocumentLang; // main language
    authors?: string[]; //original authors
    coverUrl?: string;
};

export type DocumentSection = {
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

export type ParsedData = {
    code: 0 | 1;
    meta?: DocumentMeta;
    sections?: DocumentSection[];
};

const TextSeparators = [
    '\n\n',
    '\n',
    ' ',
    '.',
    ',',
    '\u200b', // Zero-width space
    '\uff0c', //Fullwidth comma
    '\u3001', // Ideographic comma
    '\uff0e', // Fullwidth full stop
    '\u3002', //Ideographic full stop
    '',
];

const CommonSplitterParams = {
    chunkSize: 1500,
    chunkOverlap: 120,
    keepSeparator: true,
    separators: TextSeparators,
};

export async function getSplitContents(filepath: string, extName: string): Promise<Document[] | null> {
    try {
        console.time('🕰 loadAndSplit costs:');

        let textSplitter: any = null;
        if (extName === 'md') {
            textSplitter = new RecursiveCharacterTextSplitter({
                ...CommonSplitterParams,
                separators: [...new Set(TextSeparators.concat(RecursiveCharacterTextSplitter.getSeparatorsForLanguage('markdown')))],
            });
        } else if (extName === 'html') {
            textSplitter = new RecursiveCharacterTextSplitter({
                ...CommonSplitterParams,
                separators: [...new Set(TextSeparators.concat(RecursiveCharacterTextSplitter.getSeparatorsForLanguage('html')))],
            });
        } else {
            textSplitter = new RecursiveCharacterTextSplitter({ ...CommonSplitterParams });
        }

        return await getDocumentLoader(filepath, extName).loadAndSplit(textSplitter);
    } catch (error: any) {
        logError('❌ getSplitContents: ', error?.message, ', cause is: ', error?.cause);
    } finally {
        console.timeEnd('🕰 loadAndSplit costs:');
    }
    return null;
}

export async function parseFileContent(filePath: string, extName: string): Promise<ParsedData> {
    try {
        const sections = (await getSplitContents(filePath, extName)) as DocumentSection[];
        if (Array.isArray(sections) && sections.length > 0) {
            // 标题和描述暂时均从第一节内容截取
            const firstParts = sections[0].pageContent.split('\n\n');
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
                code: 1,
                meta: {
                    title,
                    description,
                    keywords,
                    lang: sections[0].metadata?.languages?.length ? (sections[0].metadata.languages[0].toUpperCase() as DocumentLang) : DocumentLang.ENG,
                    authors: ['tomartisan'], // 先写死，后面从前端传过来。或者从网络抓取
                    coverUrl: process.env.__RSN_DEFAULT_COVER, // 后边从网络抓取，或随机
                },
                sections,
            };
        }
    } catch (error) {
        logError('parseFileContent', error);
    }
    return { code: 0 };
}
