import { getOnnxModel, OnnxModel } from '@/constants/OnnxModel';
import { systemLog } from '@/utils/common';
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
                systemLog(0, index + 1, ': embedding sentence size: ', outputs?.sentence_embedding?.size);
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
        return true;
        const embeddings = await createEmbeddings(sentences);
        if (Array.isArray(embeddings) && embeddings.length > 0) {
            return await MilvusDB.saveDocument(embeddings, { metadata, dim: model.outputDimension });
        }
    } catch (error) {
        systemLog(-1, 'saveEmbeddings error: ', error);
    }
    return false;
}

export async function deleteEmbeddings(name: string) {
    // TODO: hard code for test...
    return MilvusDB.deleteDocument({
        fileName: name,
        fileType: 'md',
    });
}
