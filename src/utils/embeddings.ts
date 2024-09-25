import { getOnnxModel } from '@/constants/OnnxModel';
import { systemLog } from '@/utils/common';
import type { Document } from 'langchain/document';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';
import OptimizedTokenizer, { TokenizeResult } from './tokenizer';

let session: any;
let tokenizer: OptimizedTokenizer;

async function initialize() {
    if (!session) {
        try {
            const { localPath, localTokenizerPath, type } = getOnnxModel();
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

async function createEmbeddings(texts: string[]) {
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
        return session.run(inputFeeds);
    } catch (error) {
        systemLog(-1, error);
    }
    return null;
}

export async function saveEmbeddings(splitDocuments: Document[]) {
    try {
        const texts = splitDocuments.map(doc => doc.pageContent);
        if (texts.length > 0) {
            const outputs: any = await createEmbeddings(texts);
            systemLog(0, 'outputs keys: ', Object.keys(outputs));
            return true;
        }
    } catch (error) {
        systemLog(1, 'createEmbeddings', error);
    }
    return false;
}
