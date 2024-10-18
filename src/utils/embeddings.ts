import { getOnnxModel, OnnxModel } from '@/constants/OnnxModel';
import { getFileType, systemLog } from '@/utils/common';
import { getUnstructuredLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import type { Document } from 'langchain/document';
import path from 'node:path';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';
import MilvusDB from './database/milvus';
import OptimizedTokenizer, { TokenizeResult } from './tokenizer';

let model: OnnxModel;
let session: any;
let tokenizer: OptimizedTokenizer;

export type EmbeddingTextItem = {
    number: number;
    text: string;
    embedding: Array<number>;
};

export type DocumentMeta = {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: string[]; //original authors
    coverUrl?: string;
};

export type ParsedResult = {
    meta?: DocumentMeta;
    state: boolean; // parsed success or not
};

async function initialize() {
    if (!session) {
        try {
            model = getOnnxModel();
            if (!model) {
                systemLog(-1, 'model is not found, check your local path or config');
                return;
            }
            const { localPath, localTokenizerPath, type } = model;
            session = await InferenceSession.create(localPath, {
                enableCpuMemArena: true,
                enableMemPattern: true,
                executionMode: 'parallel',
                graphOptimizationLevel: 'all',
                logLevel: 'warning',
                // 0: Verbose, 1: Info, 2: Warning, 3: Error, 4: Fatal
                logSeverityLevel: 2,
                // 0 means use all available threads
                interOpNumThreads: 0,
                intraOpNumThreads: 0,
            });

            systemLog(1, 'Inputs:');
            session.inputNames.forEach(name => {
                systemLog(0, `  ${name}:`);
            });

            systemLog(1, 'Outputs:');
            session.outputNames.forEach(name => {
                systemLog(0, `  ${name}:`);
            });

            if (!tokenizer && localTokenizerPath) {
                tokenizer = new OptimizedTokenizer(localTokenizerPath);
                systemLog(0, 'preTokenizer and its type are: ', tokenizer.getPreTokenizer(), type);
            }
        } catch (error) {
            systemLog(-1, 'initialize onnx model error: ', error);
        }
    }
}

async function createEmbeddings(texts: string[]): Promise<Array<EmbeddingTextItem>> {
    try {
        await initialize();

        // Tokenize the texts
        const tokenizers: TokenizeResult[] = await tokenizer.batchTokenizeWithoutCache(texts);

        // Run local inference
        const embeddings = await Promise.all(
            tokenizers.map(async (cV: TokenizeResult, index: number) => {
                const inputFeeds = {
                    input_ids: new Tensor('int64', cV.inputIds, [1, cV.inputIds.length]),
                    attention_mask: new Tensor('int64', cV.attentionMask, [1, cV.attentionMask.length]),
                };
                const outputs = await session.run(inputFeeds);
                if (outputs && outputs.sentence_embedding?.cpuData) {
                    return {
                        number: index + 1,
                        text: texts[index],
                        embedding: Array.from(outputs.sentence_embedding.cpuData) as Array<number>,
                    };
                }
                return null;
            }),
        );

        // Filter out any null results
        return embeddings.filter(embedding => embedding !== null);
    } catch (error) {
        systemLog(-1, 'createEmbeddings error: ', error);
    }
    return [];
}

export async function saveEmbeddings({ metadata, sentences }: { metadata: any; sentences: string[] }) {
    try {
        const embeddings = await createEmbeddings(sentences);
        if (Array.isArray(embeddings) && embeddings.length > 0) {
            return await MilvusDB.saveDocument(embeddings, { metadata, dim: model.outputDimension });
        }
    } catch (error) {
        systemLog(-1, 'saveEmbeddings error: ', error);
    }
    return false;
}

export async function parseAndSaveContentEmbedding(filepath: string): Promise<ParsedResult> {
    try {
        const { name, ext } = path.parse(filepath);
        const fileType = getFileType(ext);

        const loader = getUnstructuredLoader(filepath);
        const documents: Document[] = await loader.load();
        const splitDocuments = await getSplitterDocument(documents);

        if (Array.isArray(splitDocuments) && splitDocuments.length > 0) {
            const content = {
                metadata: {
                    fileName: name,
                    fileType: fileType,
                    title: splitDocuments[0].pageContent || splitDocuments[0].metadata.filename,
                },
                sentences: splitDocuments.map(doc => doc.pageContent),
            };
            const ret = await saveEmbeddings(content);
            return {
                state: ret,
                meta: {
                    title: content.metadata.title,
                    description: content.sentences.slice(0, 3).join(',').substring(0, 255),
                    keywords: content.metadata.title.split(' '),
                    authors: ['tom', 'jack'],
                    coverUrl: process.env.__RSN_DEFAULT_COVER,
                },
            };
        }
    } catch (error) {
        systemLog(-1, 'error on parseAndSaveContentEmbedding: ', error);
    }
    return { state: false };
}

export async function deleteEmbeddings(name: string) {
    // TODO: hard code for test...
    return MilvusDB.deleteDocument({
        fileName: name,
        fileType: 'md',
    });
}
