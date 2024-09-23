import { getOnnxModel } from '@/constants/OnnxModel';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { systemLog } from './common';
import OptimizedTokenizer, { TokenizeResult } from './tokenizer';

let session: any;
let tokenizer: OptimizedTokenizer;

const initialize = async () => {
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
};

export const createEmbeddings = async (text: any) => {
    let embeddings: any[] = [];
    try {
        await initialize();

        // Create the feeds for the model
        const rets: TokenizeResult[] = await tokenizer.tokenize('Hello World.');

        const outputs: any[] = [];
        for (const ret of rets) {
            const Ids = ret.inputIds;
            const attentionMask = ret.attentionMask;
            // Run local inference
            const output = await session.run({
                input_ids: new Tensor('int64', Ids, [1, Ids.length]),
                attention_mask: new Tensor('int64', attentionMask, [1, attentionMask.length]),
            });
            outputs.push(output);
        }

        embeddings = outputs;
    } catch (error) {
        systemLog(-1, error);
    }
    return embeddings;
};
