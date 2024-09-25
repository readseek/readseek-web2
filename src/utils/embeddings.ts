import { getOnnxModel, OnnxModel } from '@/constants/OnnxModel';
import { systemLog } from '@/utils/common';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';
import MilvusDB from './milvus';
import OptimizedTokenizer, { TokenizeResult } from './tokenizer';

let model: OnnxModel;
let session: any;
let tokenizer: OptimizedTokenizer;

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

async function createEmbeddings(texts: string[]): Promise<Array<number>> {
    try {
        await initialize();

        // Tokenize the texts
        const tokenizers: TokenizeResult[] = await tokenizer.batchTokenizeWithoutCache(texts);

        // Create the feeds for the model
        const inputFeeds = {
            input_ids: new Tensor(
                'int64',
                tokenizers.flatMap(t => t.inputIds),
                [tokenizers.length, tokenizers[0].inputIds.length],
            ),
            attention_mask: new Tensor(
                'int64',
                tokenizers.flatMap(t => t.attentionMask),
                [tokenizers.length, tokenizers[0].attentionMask.length],
            ),
        };

        // Run local inference
        const outputs = await session.run(inputFeeds);
        systemLog(0, 'createEmbeddings outputs: ', Object.keys(outputs), 'sentence size: ', outputs?.sentence_embedding?.size);
        if (outputs && outputs.sentence_embedding?.cpuData) {
            return Array.from(outputs.sentence_embedding.cpuData);
        }
    } catch (error) {
        systemLog(-1, 'createEmbeddings', error);
    }
    return [];
}

export async function saveEmbeddings({ metadata, sentences }: { metadata: any; sentences: string[] }) {
    try {
        const embeddings = await createEmbeddings(sentences);
        return await MilvusDB.saveDocument(embeddings, { metadata, dim: model.outputDimension });
    } catch (error) {
        systemLog(-1, 'saveEmbeddings', error);
    }
    return false;
}
