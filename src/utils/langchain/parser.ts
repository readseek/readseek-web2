'use server';

import type { Document } from 'langchain/document';

import fs from 'fs/promises';

import { TokenTextSplitter } from 'langchain/text_splitter';
import { remark } from 'remark';
import strip from 'strip-markdown';

import { Prompt } from '@/constants/prompt';
import { DocumentLang, DocumentType } from '@/models/Document';
import { logError } from '@/utils/logger';

import { generateWithContext, generateSummarization } from './generator';
import { getDocumentLoader } from './loader';

export type DocumentMeta = {
    title: string;
    description: string;
    keywords: string[];
    lang: DocumentLang; // main language
    coverUrl?: string;
    authors?: string[]; //original authors
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

export async function getSplitterDocument(filepath: string, extName: string): Promise<Document[] | null> {
    try {
        console.time('🕰 loadAndSplit costs:');

        const splitter: any = new TokenTextSplitter({
            chunkSize: 2500,
            chunkOverlap: 200,
        });

        return await getDocumentLoader(filepath, extName).loadAndSplit(splitter);
    } catch (error: any) {
        logError('❌ getSplitterDocument: ', error?.message, ', cause is: ', error?.cause);
    } finally {
        console.timeEnd('🕰 loadAndSplit costs:');
    }
    return null;
}

export async function getPureTextContent(filepath: string, extName: string): Promise<string | null> {
    try {
        if (extName === DocumentType.MARKDOWN) {
            const content = await fs.readFile(filepath || '', 'utf-8');
            const result = await remark().use(strip).process(content);
            return String(result);
        }
        const file = await getDocumentLoader(filepath, extName).load();
        if (file && file.length) {
            return file[0].pageContent;
        }
    } catch (error) {
        logError(error);
    }
    return null;
}

export async function parseFileContent(filepath: string, extName: string): Promise<ParsedData> {
    try {
        const parsed: any = {
            code: 1,
            meta: { title: '', description: '', keywords: [], lang: DocumentLang.ENG, coverUrl: '', authors: [] },
            sections: null,
        };

        const textContent = await getPureTextContent(filepath, extName);
        if (textContent) {
            // Get title description and keywords from LLMs
            const [titles, description] = await Promise.all([generateWithContext(Prompt.templates.title, textContent, { topK: 5 }), generateSummarization(textContent, { maxTokens: 100 })]);
            const keywords = await generateWithContext(Prompt.templates.keywords, description, { topK: 5 });

            // @ts-ignore
            parsed.meta.title = (titles?.sort((a: any, b: any) => b.score - a.score).shift() as any)?.answer;
            // @ts-ignore
            parsed.meta.keywords = keywords?.map((k: any) => k.answer);
            parsed.meta.description = description;
        }

        const sections = (await getSplitterDocument(filepath, extName)) as DocumentSection[];
        if (sections && sections?.length > 0) {
            parsed.sections = sections;
            parsed.meta.lang = sections[0].metadata?.languages?.length ? (sections[0].metadata.languages[0].toUpperCase() as DocumentLang) : DocumentLang.ENG;
            parsed.meta.authors = ['tomartisan']; // 先写死，后面从前端传过来。或者从网络抓取
            parsed.meta.coverUrl = process.env.__RSN_DEFAULT_COVER; // 后边从网络抓取，或随机
        }

        return parsed as ParsedData;
    } catch (error) {
        logError('parseFileContent', error);
    }
    return { code: 0 };
}
